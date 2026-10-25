# Atlas Voos — App Android

Aplicativo Android de exploração de destinos, aeroportos e radar aéreo. O projeto Android completo está neste repositório e usa os arquivos web embarcados no APK.

## Instalar no Android

1. Abra a aba **Actions** neste repositório.
2. Abra a execução do fluxo **Gerar APK Android** (ou clique em **Run workflow**).
3. Quando a execução ficar verde, role até **Artifacts** e baixe **AtlasVoos-Android-APK**.
4. Extraia o ZIP baixado para encontrar `app-debug.apk`, que pode ser instalado no Android.

O workflow já faz a compilação usando JDK 17, Gradle 8.9 e Android SDK 35.

O APK gerado é de desenvolvimento (debug), próprio para instalação de testes; não é uma versão release assinada para publicação na Play Store. Mapa, meteorologia e voos usam serviços externos que dependem de internet e disponibilidade.

Para mais instruções veja `README-ANDROID.md` e `LEIA-ME-ANTES-DE-COMPILAR.txt`.
