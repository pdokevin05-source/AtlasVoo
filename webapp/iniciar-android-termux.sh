#!/data/data/com.termux/files/usr/bin/bash
# Executar após: pkg install nodejs
set -e
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo 'Instale Node.js no Termux com: pkg install nodejs'
  exit 1
fi
printf '\nATLAS VOOS PARA ANDROID\nAbra no Chrome: http://localhost:3000\nMantenha o Termux aberto. A Internet deve estar ativa.\n\n'
HOST=127.0.0.1 PORT=3000 node server.js
