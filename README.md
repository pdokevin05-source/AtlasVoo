# Atlas Voos — Android

Projeto do aplicativo Android Atlas Voos.

## Gerar APK usando GitHub Actions

1. Envie para a raiz do repositório o arquivo `AtlasVoos_App_Android_Projeto.zip` fornecido na conversa do ChatGPT (não extraia o ZIP).
2. Abra **Actions → Gerar APK Android → Run workflow** (ou aguarde o disparo automático após o envio do ZIP).
3. Após execução concluída com sucesso, abra a execução e baixe o artefato `AtlasVoos-Android-APK`.
4. Extraia o arquivo `.apk` do artefato e instale no Android.

O fluxo de compilação extrai o projeto original, configura Java 17, Gradle 8.9, Android SDK 35 e gera um APK de debug instalável. O APK não será gerado até que o arquivo ZIP esteja no repositório.

Não publique chaves API ou informações privadas no repositório. Serviços externos de mapas e voos exigem Internet.
