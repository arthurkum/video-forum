@echo off
title Publicar Foro en GitHub Pages (Online 24/7)
color 0A
echo ========================================================
echo     SUBIR Y ALOJAR EN GITHUB PAGES (ONLINE 24/7)
echo ========================================================
echo.
cd /d "%~dp0"

echo [1/4] Comprobando Git...
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git no esta instalado en tu sistema.
    echo Puedes descargarlo gratis desde: https://git-scm.com/
    pause
    exit /b
)

echo [2/4] Preparando repositorio local...
if not exist ".git" (
    git init -b main
)

git add .
git commit -m "Publicar VideoForum en GitHub Pages"

echo.
echo ========================================================
echo [3/4] CONECTAR CON TU REPOSITORIO DE GITHUB
echo ========================================================
echo.
echo 1. Entra a tu cuenta en https://github.com/new
echo 2. Crea un repositorio PUBLICO (ejemplo: mi-foro-video)
echo 3. Copia el enlace HTTPS que te da GitHub
echo    (ejemplo: https://github.com/tu-usuario/mi-foro-video.git)
echo.
set /p REPO_URL="Pega aqui el enlace HTTPS de tu repositorio de GitHub: "

if "%REPO_URL%"=="" (
    echo No ingresaste ninguna URL. Operacion cancelada.
    pause
    exit /b
)

git remote remove origin >nul 2>nul
git remote add origin %REPO_URL%
git branch -M main

echo.
echo [4/4] Subiendo archivos a GitHub...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================================
    echo             SUBIDA COMPLETADA CON EXITO
    echo ========================================================
    echo.
    echo Para activar tu web ONLINE 24/7 con enlace unico:
    echo 1. Ve a tu repositorio en GitHub.
    echo 2. Haz clic en 'Settings' (Configuracion) arriba a la derecha.
    echo 3. En el menu izquierdo haz clic en 'Pages'.
    echo 4. En 'Branch', selecciona 'main' y la carpeta '/ (root)', y pulsa 'Save'.
    echo.
    echo En 1 minuto tendras tu enlace publico 24/7:
    echo https://tu-usuario.github.io/tu-repositorio/
    echo ========================================================
) else (
    echo.
    echo Hubo un inconveniente al subir. Asegurate de haber iniciado sesion
    echo en GitHub en tu navegador o mediante credenciales.
)

pause
