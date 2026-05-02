# Script para limpiar e instalar dependencias
# Ejecuta desde PowerShell: .\install-dependencies.ps1

$backendPath = "C:\Users\estef\OneDrive\Escritorio\Ausentimo\Backend"

Set-Location $backendPath

Write-Host "🧹 Limpiando node_modules..." -ForegroundColor Cyan
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
    Write-Host "✅ node_modules eliminado" -ForegroundColor Green
}

Write-Host "🧹 Limpiando package-lock.json..." -ForegroundColor Cyan
if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json" -ErrorAction SilentlyContinue
    Write-Host "✅ package-lock.json eliminado" -ForegroundColor Green
}

Write-Host ""
Write-Host "📦 Instalando dependencias..." -ForegroundColor Cyan
npm install

Write-Host ""
Write-Host "✅ ¡Instalación completada!" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. npm run dev   (para iniciar el backend)"
Write-Host "2. curl -X POST http://localhost:3001/api/listener/start   (para iniciar captura de respuestas)"
