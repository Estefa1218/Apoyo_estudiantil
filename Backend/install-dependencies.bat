@echo off
REM Script para limpiar e instalar dependencias en Windows
REM Ejecuta desde PowerShell: .\install-dependencies.bat

cd C:\Users\estef\OneDrive\Escritorio\Ausentimo\Backend

echo Eliminando node_modules...
if exist node_modules (
    rmdir /s /q node_modules
    echo OK - node_modules eliminado
) else (
    echo node_modules no existe
)

echo Eliminando package-lock.json...
if exist package-lock.json (
    del package-lock.json
    echo OK - package-lock.json eliminado
) else (
    echo package-lock.json no existe
)

echo.
echo Instalando dependencias...
call npm install

echo.
echo Instalacion completada!
pause
