package br.com.atlasvoos;

import android.Manifest;
import android.app.Activity;
import android.app.ActivityManager;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.GeolocationPermissions;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

/** Android application with a bundled UI and public data API — no external hosting needed. */
public class MainActivity extends Activity {
    private static final String LOCAL_ORIGIN = "https://atlasvoos.local";
    private static final int LOCATION_REQUEST = 42;
    private WebView web;
    private AtlasApi api;
    private GeolocationPermissions.Callback pendingLocationCallback;
    private String pendingLocationOrigin;

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        api = new AtlasApi(getApplicationContext());
        web = new WebView(this);
        web.setBackgroundColor(0xFF07111D);
        web.setOverScrollMode(WebView.OVER_SCROLL_NEVER);
        WebSettings settings = web.getSettings();
        // Identificação para o provedor de mapas, em vez de um WebView anônimo.
        settings.setUserAgentString(settings.getUserAgentString() + " AtlasVoos/1.2 (+https://github.com/pdokevin05-source/AtlasVoo)");
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setGeolocationEnabled(true);
        settings.setLoadsImagesAutomatically(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setSupportMultipleWindows(false);
        web.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri url = request.getUrl();
                if ("https".equals(url.getScheme()) && "atlasvoos.local".equals(url.getHost())) {
                    return api.handle(url, request.getMethod());
                }
                return super.shouldInterceptRequest(view, request);
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri url = request.getUrl();
                if (LOCAL_ORIGIN.equals(url.getScheme() + "://" + url.getHost())) return false;
                if (!request.isForMainFrame()) return false;
                if ("https".equals(url.getScheme()) || "http".equals(url.getScheme())) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, url)); }
                    catch (Exception ex) { Toast.makeText(MainActivity.this, "Não foi possível abrir o endereço.", Toast.LENGTH_SHORT).show(); }
                }
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                if (!origin.startsWith(LOCAL_ORIGIN)) { callback.invoke(origin, false, false); return; }
                if (locationGranted()) { callback.invoke(origin, true, false); return; }
                pendingLocationCallback = callback;
                pendingLocationOrigin = origin;
                requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION}, LOCATION_REQUEST);
            }
        });
        setContentView(web);
        ActivityManager am = (ActivityManager) getSystemService(ACTIVITY_SERVICE);
        // Android Go / baixo limite de memória: sinalização sem ponte JavaScript insegura.
        boolean lowRam = am != null && (am.isLowRamDevice() || am.getMemoryClass() <= 128);
        web.loadUrl(LOCAL_ORIGIN + "/index.html" + (lowRam ? "?lite=1" : ""));
    }

    private boolean locationGranted() {
        return checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
               checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
    }

    @Override public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == LOCATION_REQUEST && pendingLocationCallback != null) {
            pendingLocationCallback.invoke(pendingLocationOrigin, locationGranted(), false);
            pendingLocationCallback = null;
            pendingLocationOrigin = null;
        }
    }

    @Override public void onBackPressed() {
        if (web != null && web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    @Override protected void onPause() {
        if (web != null) web.onPause();
        super.onPause();
    }

    @Override protected void onResume() {
        super.onResume();
        if (web != null) web.onResume();
    }

    @Override protected void onDestroy() {
        if (web != null) { web.stopLoading(); web.destroy(); web = null; }
        super.onDestroy();
    }
}
