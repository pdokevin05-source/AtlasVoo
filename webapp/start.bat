@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao encontrado. Instale Node.js 20 ou mais recente em https://nodejs.org/
  pause
  exit /b 1
)
echo Iniciando Atlas Voos em http://localhost:3000
start "" cmd /c "ping 127.0.0.1 -n 3 >nul & start http://localhost:3000"
node server.js
pause
