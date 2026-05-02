@echo off
REM Sistema PAE - Script de Inicio para Windows
REM Este script configura todo automáticamente

setlocal enabledelayedexpansion

color 0B
cls

echo.
echo ╔════════════════════════════════════════════════╗
echo ║    Sistema PAE - Script de Inicio Rápido      ║
echo ╚════════════════════════════════════════════════╝
echo.

REM Verificar Node.js
echo [1/6] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no está instalado. Instálalo desde: https://nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js encontrado
echo.

REM Verificar npm
echo [2/6] Verificando npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm no está instalado
    pause
    exit /b 1
)
echo ✅ npm encontrado
echo.

REM Instalar dependencias
echo [3/6] Instalando dependencias...
call npm install
if errorlevel 1 (
    echo ❌ Error instalando dependencias
    pause
    exit /b 1
)
echo ✅ Dependencias instaladas
echo.

REM Verificar MySQL
echo [4/6] Verificando MySQL...
mysql --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  MySQL CLI no encontrado en PATH
    echo Intenta agregar MySQL bin folder a tu PATH
    echo Ruta típica: C:\Program Files\MySQL\MySQL Server 8.0\bin
    echo.
    echo Para continuar manualmente:
    pause
) else (
    echo ✅ MySQL encontrado
    echo.
    
    echo [5/6] Creando base de datos...
    mysql -u root -p"milo2003" < sistema_pae.sql 2>nul
    if errorlevel 1 (
        echo ⚠️  No se pudo crear la BD automáticamente
        echo Abre MySQL y ejecuta manualmente:
        echo   source sistema_pae.sql;
    ) else (
        echo ✅ Base de datos creada
    )
    echo.
)

REM Generar archivos de prueba
echo [6/6] Generando archivos de prueba...
if exist generate_test_files.py (
    python generate_test_files.py 2>nul
    if errorlevel 1 (
        echo ⚠️  Python no disponible, archivos de prueba no generados
    ) else (
        echo ✅ Archivos de prueba generados
    )
) else (
    echo ℹ️  Archivo generar_test_files.py no encontrado
)

echo.
echo ╔════════════════════════════════════════════════╗
echo ║       ✅ Configuración Completada             ║
echo ╚════════════════════════════════════════════════╝
echo.

echo PRÓXIMOS PASOS:
echo ═══════════════
echo.
echo 1. Abre un terminal (PowerShell o CMD)
echo.
echo 2. Asegúrate que MySQL esté corriendo:
echo    net start MySQL80
echo.
echo 3. Ejecuta el servidor:
echo    npm run dev
echo.
echo 4. En otra terminal, prueba la conexión:
echo    curl http://localhost:3001/api/test
echo.
echo 5. Sube un archivo de prueba:
echo    curl -X POST -F "file=@test_estudiantes.xlsx" ^
echo    http://localhost:3001/api/upload
echo.

echo INFORMACIÓN:
echo ═════════════
echo • Servidor:          http://localhost:3001
echo • Test BD:           http://localhost:3001/api/test
echo • Upload:            POST http://localhost:3001/api/upload
echo • Ver estado:        GET http://localhost:3001/api/upload/status/^{id^}
echo.

echo Documentación:
echo • README.md         - Guía general
echo • TESTING.md        - Guía de pruebas detallada
echo • EXECUTION_CHECKLIST.md - Checklist completo
echo.

pause
