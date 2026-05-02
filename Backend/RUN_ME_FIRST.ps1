# Universidad Autónoma - Sistema PAE Backend
# Script de Inicio Rápido para Windows PowerShell

Write-Host "`n" -ForegroundColor White
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        Sistema PAE - Inicio Rápido            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Función para mostrar mensajes
function Log-Step {
    param([string]$message)
    Write-Host "   ▶ $message" -ForegroundColor Yellow
}

function Log-Success {
    param([string]$message)
    Write-Host "   ✅ $message" -ForegroundColor Green
}

function Log-Error {
    param([string]$message)
    Write-Host "   ❌ $message" -ForegroundColor Red
}

# Paso 1: Verificar Node.js
Log-Step "Verificando Node.js..."
if (node --version) {
    Log-Success "Node.js encontrado: $(node --version)"
} else {
    Log-Error "Node.js no está instalado"
    exit 1
}

# Paso 2: Verificar npm
Log-Step "Verificando npm..."
if (npm --version) {
    Log-Success "npm encontrado: $(npm --version)"
} else {
    Log-Error "npm no está instalado"
    exit 1
}

# Paso 3: Verificar MySQL
Log-Step "Verificando MySQL..."
if (Get-Service MySQL80 -ErrorAction SilentlyContinue) {
    Log-Success "Servicio MySQL80 encontrado"
    $mysqlStatus = (Get-Service MySQL80).Status
    if ($mysqlStatus -eq "Running") {
        Log-Success "MySQL está corriendo"
    } else {
        Log-Step "Iniciando MySQL..."
        Start-Service MySQL80
        Start-Sleep -Seconds 3
        Log-Success "MySQL iniciado"
    }
} else {
    Log-Error "MySQL80 no encontrado. Instala MySQL Server 8.0"
    exit 1
}

# Paso 4: Instalar dependencias
Write-Host ""
Log-Step "Instalando dependencias de NPM..."
npm install
if ($LASTEXITCODE -eq 0) {
    Log-Success "Dependencias instaladas"
} else {
    Log-Error "Error instalando dependencias"
    exit 1
}

# Paso 5: Crear base de datos
Write-Host ""
Log-Step "Creando base de datos..."
$dbExists = mysql -u root -p"milo2003" -e "USE sistema_pae;" 2>$null
if ($LASTEXITCODE -eq 0) {
    Log-Success "Base de datos 'sistema_pae' ya existe"
} else {
    Log-Step "Base de datos no encontrada, creando..."
    mysql -u root -p"milo2003" < sistema_pae.sql
    if ($LASTEXITCODE -eq 0) {
        Log-Success "Base de datos creada exitosamente"
    } else {
        Log-Error "Error creando base de datos"
        exit 1
    }
}

# Paso 6: Generar archivos de prueba
Write-Host ""
Log-Step "Generando archivos de prueba..."
if (Test-Path "generate_test_files.py") {
    python3 generate_test_files.py 2>$null
    if ($LASTEXITCODE -eq 0 -or (Test-Path "test_estudiantes.xlsx")) {
        Log-Success "Archivos de prueba generados"
    } else {
        Log-Step "Python no disponible, continuando sin archivos de prueba"
    }
} else {
    Log-Step "Archivo generate_test_files.py no encontrado"
}

# Resumen
Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║          ✅ Configuración Completada          ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "Próximos pasos:" -ForegroundColor Cyan
Write-Host "  1. Abre una terminal PowerShell" -ForegroundColor White
Write-Host "  2. Ejecuta: npm run dev" -ForegroundColor Yellow
Write-Host "  3. Abre otra terminal y ejecuta:" -ForegroundColor White
Write-Host "     curl http://localhost:3001/api/test" -ForegroundColor Yellow
Write-Host ""

Write-Host "URLs importantes:" -ForegroundColor Cyan
Write-Host "  • Servidor:      http://localhost:3001" -ForegroundColor White
Write-Host "  • API Test:      http://localhost:3001/api/test" -ForegroundColor White
Write-Host "  • Upload:        POST http://localhost:3001/api/upload" -ForegroundColor White
Write-Host "  • Status:        GET http://localhost:3001/api/upload/status/1" -ForegroundColor White
Write-Host ""

Write-Host "Para iniciar (abre nueva terminal):" -ForegroundColor Green
Write-Host "  npm run dev" -ForegroundColor Yellow
Write-Host ""
