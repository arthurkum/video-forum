@echo off
title VideoForum - Compartir en Internet (Tunel Publico)
color 0A
echo ========================================================
echo       COMPARTIR FORO DE VIDEOS EN INTERNET
echo ========================================================
echo.
echo Este script creara un enlace publico seguro (HTTPS)
echo para que cualquier persona en internet pueda ver tu
echo foro, ver los videos y comentar desde cualquier dispositivo.
echo.
echo Asegurate de que el servidor ya este encendido con:
echo iniciar-foro.bat
echo.
pause
echo.
echo Generando enlace publico con LocalTunnel...
echo.
call npx.cmd localtunnel --port 3000
pause
