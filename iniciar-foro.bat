@echo off
title VideoForum - Servidor Local
color 0B
echo ========================================================
echo         INICIANDO SERVIDOR DEL FORO DE VIDEOS
echo ========================================================
echo.
cd /d "%~dp0"

echo [1/2] Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias de Node.js...
    call npm.cmd install
)

echo [2/2] Abriendo tu navegador y levantando el servidor...
start http://localhost:3000
echo.
echo Presiona Ctrl+C en esta ventana para detener el foro cuando termines.
echo.
node server.js
pause
