# Script para crear la estructura de carpetas necesaria para recursos
# Ejecutar: PowerShell.exe -ExecutionPolicy Bypass -File setup_folders.ps1

Write-Host "📁 Creando estructura de carpetas para recursos..." -ForegroundColor Cyan
Write-Host ""

# Crear carpeta principal de uploads si no existe
$uploadPath = Join-Path (Get-Location) "uploads\recursos"

if (-not (Test-Path $uploadPath)) {
    New-Item -ItemType Directory -Path $uploadPath -Force | Out-Null
    Write-Host "✅ Carpeta creada: $uploadPath" -ForegroundColor Green
} else {
    Write-Host "✓ Carpeta ya existe: $uploadPath" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Estructura de carpetas lista:" -ForegroundColor Green
Write-Host "uploads\"
Write-Host "└── recursos\"
Write-Host ""

Write-Host "📝 Los archivos subidos se guardarán en: uploads\recursos\" -ForegroundColor Yellow
Write-Host ""

# Verificar que existe .env
$envPath = Join-Path (Get-Location) ".env"
if (Test-Path $envPath) {
    Write-Host "✓ Archivo .env encontrado" -ForegroundColor Green
    
    # Verificar que UPLOAD_DIR está configurado
    $envContent = Get-Content $envPath
    if ($envContent -match "UPLOAD_DIR") {
        Write-Host "✓ UPLOAD_DIR ya está configurado en .env" -ForegroundColor Green
    } else {
        Write-Host "⚠️ UPLOAD_DIR no está configurado en .env" -ForegroundColor Yellow
        Write-Host "   Considera agregar: UPLOAD_DIR=uploads/recursos/" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️ Archivo .env no encontrado" -ForegroundColor Yellow
    Write-Host "   Copia .env.example a .env y configura las variables" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ ¡Listo para empezar!" -ForegroundColor Green
