package br.com.atlasvoos;

import android.content.Context;
import android.net.Uri;
import android.webkit.WebResourceResponse;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.TimeZone;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Lightweight in-app replacement for the original Node API. Requests stay in the
 * Android process; only public HTTPS sources are contacted, never user-controlled URLs.
 * No fake aircraft, no fabricated fares, no embedded paid-provider credentials.
 */
final class AtlasApi {
    private final Context context;
    private final ExecutorService airportUpdater = Executors.newSingleThreadExecutor();
    private final ConcurrentHashMap<String, CacheItem> cache = new ConcurrentHashMap<>();
    private final JSONArray seed;
    private volatile JSONArray airports;
    private volatile boolean airportsLive = false;
    private volatile long airportsUpdated = 0;

    private static final class CacheItem {
        final JSONObject value;
        final long expiry;
        CacheItem(JSONObject value, long expiry) { this.value = value; this.expiry = expiry; }
    }

    AtlasApi(Context context) {
        this.context = context.getApplicationContext();
        JSONArray loaded;
        try (InputStream input = this.context.getAssets().open("webapp/airports-seed.json")) {
            loaded = new JSONArray(readAll(input, 500_000));
        } catch (Exception ex) { loaded = new JSONArray(); }
        seed = loaded;
        airports = loaded;
        restoreCatalog();
        airportUpdater.submit(this::refreshAirports);
    }

    WebResourceResponse handle(Uri url, String method) {
        String path = url.getPath();
        if (path == null || path.equals("/")) path = "/index.html";
        try {
            if (path.startsWith("/api/")) {
                if (!"GET".equals(method)) return error(405, "Método não permitido");
                switch (path) {
                    case "/api/health": return json(200, health());
                    case "/api/airports": return json(200, new JSONObject()
                            .put("airports", airports).put("fallback", !airportsLive)
                            .put("updatedAt", airportsLive ? airportsUpdated : JSONObject.NULL));
                    case "/api/aircraft": return json(200, aircraft(url));
                    case "/api/route": return json(200, route(url));
                    case "/api/fares": return error(503, "Para pesquisar preços, use a busca externa. Nenhum provedor de tarifas foi configurado.");
                    default: return error(404, "Endpoint não encontrado");
                }
            }
            return serveAsset(path);
        } catch (IllegalArgumentException ex) {
            return error(400, ex.getMessage());
        } catch (Exception ex) {
            return error(503, "Não foi possível consultar a fonte externa neste momento.");
        }
    }

    private JSONObject health() throws Exception {
        return new JSONObject().put("ok", true).put("online", true)
                .put("sources", new JSONArray().put("OpenStreetMap").put("OurAirports")
                        .put("Open-Meteo").put("adsb.lol").put("airplanes.live").put("ADSBDB"))
                .put("faresConfigured", false).put("faresMode", "unconfigured")
                .put("airportsCount", airports.length()).put("airportsLive", airportsLive);
    }

    private JSONObject aircraft(Uri uri) throws Exception {
        double lat = number(uri.getQueryParameter("lat"));
        double lon = number(uri.getQueryParameter("lon"));
        double radius = number(uri.getQueryParameter("radius") == null ? "250" : uri.getQueryParameter("radius"));
        if (lat < -90 || lat > 90 || lon < -180 || lon > 180 || radius < 1 || radius > 250)
            throw new IllegalArgumentException("Coordenadas ou raio inválidos");
        String key = String.format(Locale.US, "%.2f/%.2f/%.0f", lat, lon, radius);
        CacheItem hit = cache.get("air:" + key);
        if (hit != null && hit.expiry > System.currentTimeMillis()) return hit.value;
        String params = String.format(Locale.US, "%.4f/%.4f/%.0f", lat, lon, radius);
        String[][] providers = {
                {"adsb.lol", "https://api.adsb.lol/v2/point/" + params},
                {"airplanes.live", "https://api.airplanes.live/v2/point/" + params},
                {"adsb.one", "https://api.adsb.one/v2/point/" + params}
        };
        for (String[] p : providers) {
            try {
                JSONObject data = fetchJson(p[1], 4300);
                JSONArray found = data.optJSONArray("ac");
                if (found == null) continue;
                JSONObject result = new JSONObject().put("provider", p[0])
                        .put("updatedAt", isoNow()).put("aircraft", found)
                        .put("total", found.length()).put("radiusNm", radius);
                cache.put("air:" + key, new CacheItem(result, System.currentTimeMillis() + 16000));
                return result;
            } catch (Exception ignored) { /* Try next documented public provider. */ }
        }
        throw new IOException("Fontes ADS-B indisponíveis");
    }

    private JSONObject route(Uri uri) throws Exception {
        String callsign = uri.getQueryParameter("callsign");
        if (callsign == null || !callsign.trim().toUpperCase(Locale.US).matches("[A-Z0-9]{2,12}"))
            throw new IllegalArgumentException("Indicativo de voo inválido");
        callsign = callsign.trim().toUpperCase(Locale.US);
        CacheItem hit = cache.get("route:" + callsign);
        if (hit != null && hit.expiry > System.currentTimeMillis()) return hit.value;
        JSONObject data = fetchJson("https://api.adsbdb.com/v0/callsign/" + callsign, 9500);
        JSONObject root = data.optJSONObject("response");
        JSONObject flightRoute = root == null ? null : root.optJSONObject("flightroute");
        if (flightRoute == null && root != null) flightRoute = root.optJSONObject("route");
        if (flightRoute == null) flightRoute = root;
        JSONObject route = null;
        if (flightRoute != null && flightRoute.optJSONObject("destination") != null) {
            route = new JSONObject().put("origin", flightRoute.opt("origin"))
                    .put("destination", flightRoute.opt("destination"))
                    .put("airline", flightRoute.opt("airline"))
                    .put("midpoint", flightRoute.opt("midpoint"));
        }
        JSONObject result = new JSONObject().put("route", route == null ? JSONObject.NULL : route)
                .put("provider", "ADSBDB");
        cache.put("route:" + callsign, new CacheItem(result, System.currentTimeMillis() + 21600000));
        return result;
    }

    private static double number(String value) {
        try {
            double n = Double.parseDouble(value);
            if (!Double.isNaN(n) && !Double.isInfinite(n)) return n;
        } catch (Exception ignored) { }
        throw new IllegalArgumentException("Coordenadas ou raio inválidos");
    }

    private WebResourceResponse serveAsset(String path) throws IOException {
        final Set<String> allowed = new HashSet<>();
        String[] paths = {"index.html", "app.js", "mobile.js", "style.css", "mobile.css",
                "airports-seed.json", "sw.js", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png"};
        java.util.Collections.addAll(allowed, paths);
        String relative = path.substring(1);
        if (!allowed.contains(relative)) return error(404, "Arquivo não encontrado");
        String mime = "text/plain";
        if (relative.endsWith(".html")) mime = "text/html";
        else if (relative.endsWith(".js")) mime = "application/javascript";
        else if (relative.endsWith(".css")) mime = "text/css";
        else if (relative.endsWith(".json")) mime = "application/json";
        else if (relative.endsWith(".webmanifest")) mime = "application/manifest+json";
        else if (relative.endsWith(".png")) mime = "image/png";
        InputStream file = context.getAssets().open("webapp/" + relative);
        return response(200, mime, file);
    }

    private static WebResourceResponse json(int status, JSONObject value) {
        return response(status, "application/json", new ByteArrayInputStream(value.toString().getBytes(StandardCharsets.UTF_8)));
    }
    private static WebResourceResponse error(int status, String message) {
        try { return json(status, new JSONObject().put("error", message)); }
        catch (Exception ex) { return response(500, "text/plain", new ByteArrayInputStream("Error".getBytes(StandardCharsets.UTF_8))); }
    }
    private static WebResourceResponse response(int status, String type, InputStream bytes) {
        WebResourceResponse r = new WebResourceResponse(type, type.startsWith("image/") ? null : "UTF-8", bytes);
        Map<String, String> headers = new HashMap<>();
        headers.put("Cache-Control", "no-store");
        headers.put("X-Content-Type-Options", "nosniff");
        r.setStatusCodeAndReasonPhrase(status, status == 200 ? "OK" : "Error");
        r.setResponseHeaders(headers);
        return r;
    }

    private static JSONObject fetchJson(String url, int timeout) throws Exception {
        try (InputStream input = connect(url, timeout)) {
            return new JSONObject(readAll(input, 10_000_000));
        }
    }
    private static InputStream connect(String url, int timeout) throws IOException {
        HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
        conn.setInstanceFollowRedirects(true);
        conn.setConnectTimeout(timeout);
        conn.setReadTimeout(timeout);
        conn.setRequestProperty("User-Agent", "AtlasVoosAndroid/1.0 (travel map)");
        conn.setRequestProperty("Accept", "application/json, text/csv, */*");
        if (conn.getResponseCode() < 200 || conn.getResponseCode() >= 300) {
            int code = conn.getResponseCode();
            conn.disconnect();
            throw new IOException("Upstream HTTP " + code);
        }
        return conn.getInputStream();
    }
    private static String readAll(InputStream input, int limit) throws IOException {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        byte[] block = new byte[8192];
        int n;
        while ((n = input.read(block)) != -1) {
            if (buffer.size() + n > limit) throw new IOException("Resposta grande demais");
            buffer.write(block, 0, n);
        }
        return buffer.toString("UTF-8");
    }
    private static String isoNow() {
        SimpleDateFormat fmt = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US);
        fmt.setTimeZone(TimeZone.getTimeZone("UTC"));
        return fmt.format(new Date());
    }
    private void restoreCatalog() {
        File cacheFile = new File(context.getFilesDir(), "airports-live.json");
        if (!cacheFile.exists()) return;
        try (InputStream input = new FileInputStream(cacheFile)) {
            JSONArray saved = new JSONArray(readAll(input, 3_000_000));
            if (saved.length() < 1500) return;
            airports = saved;
            airportsLive = true;
            airportsUpdated = cacheFile.lastModified();
        } catch (Exception ignored) { }
    }
    private void refreshAirports() {
        if (airportsLive && System.currentTimeMillis() - airportsUpdated < 86400000L) return;
        final String url = "https://davidmegginson.github.io/ourairports-data/airports.csv";
        try (InputStream input = connect(url, 14000);
             BufferedReader reader = new BufferedReader(new InputStreamReader(input, StandardCharsets.UTF_8))) {
            String first = reader.readLine();
            if (first == null) return;
            List<String> header = csvCells(first.replace("\uFEFF", ""));
            int type = header.indexOf("type"), name = header.indexOf("name"), lat = header.indexOf("latitude_deg");
            int lon = header.indexOf("longitude_deg"), iso = header.indexOf("iso_country"), service = header.indexOf("scheduled_service");
            int iata = header.indexOf("iata_code"), ident = header.indexOf("ident");
            if (type < 0 || name < 0 || lat < 0 || lon < 0 || iso < 0 || service < 0 || iata < 0 || ident < 0) return;
            JSONArray updated = new JSONArray();
            Set<String> seen = new HashSet<>();
            String line;
            int rows = 0;
            while ((line = reader.readLine()) != null && rows++ < 100000) {
                List<String> cells = csvCells(line);
                if (cells.size() <= Math.max(Math.max(iata, lon), name)) continue;
                String code = cells.get(iata).trim().toUpperCase(Locale.US);
                if (!code.matches("[A-Z0-9]{3}") || seen.contains(code)) continue;
                String kind = cells.get(type);
                String scheduled = cells.get(service);
                if (!kind.equals("large_airport") && !kind.equals("medium_airport") && !scheduled.equals("yes")) continue;
                try {
                    double latitude = Double.parseDouble(cells.get(lat));
                    double longitude = Double.parseDouble(cells.get(lon));
                    if (Double.isNaN(latitude) || Double.isInfinite(latitude) || Double.isNaN(longitude) || Double.isInfinite(longitude)) continue;
                    JSONObject item = new JSONObject().put("iata", code).put("icao", cells.get(ident))
                            .put("name", cells.get(name)).put("lat", latitude).put("lon", longitude)
                            .put("country", cells.get(iso)).put("scheduled", scheduled.equals("yes"))
                            .put("type", kind);
                    updated.put(item);
                    seen.add(code);
                } catch (Exception ignored) { }
            }
            if (updated.length() < 1500) return;
            for (int i = 0; i < seed.length(); ++i) {
                JSONObject item = seed.optJSONObject(i);
                if (item != null && !seen.contains(item.optString("iata"))) updated.put(item);
            }
            File file = new File(context.getFilesDir(), "airports-live.json");
            try (FileOutputStream output = new FileOutputStream(file)) {
                output.write(updated.toString().getBytes(StandardCharsets.UTF_8));
            }
            airports = updated;
            airportsLive = true;
            airportsUpdated = System.currentTimeMillis();
        } catch (Exception ignored) { /* Saved catalog or embedded seed remains available. */ }
    }
    private static List<String> csvCells(String line) {
        List<String> cells = new ArrayList<>();
        StringBuilder cell = new StringBuilder();
        boolean quote = false;
        for (int i = 0; i < line.length(); ++i) {
            char c = line.charAt(i);
            if (c == '"') {
                if (quote && i+1 < line.length() && line.charAt(i+1) == '"') { cell.append('"'); ++i; }
                else quote = !quote;
            } else if (c == ',' && !quote) { cells.add(cell.toString()); cell.setLength(0); }
            else cell.append(c);
        }
        cells.add(cell.toString());
        return cells;
    }
}
