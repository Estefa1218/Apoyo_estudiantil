#!/bin/bash
# Script para crear la estructura de carpetas necesaria para recursos
# Ejecutar: bash setup_folders.sh

echo "📁 Creando estructura de carpetas para recursos..."

# Crear carpeta principal de uploads si no existe
mkdir -p uploads/recursos

# Mostrar estructura creada
echo ""
echo "✅ Estructura de carpetas creada:"
echo "uploads/"
echo "└── recursos/"
echo ""

# Dar permisos de escritura
chmod -R 755 uploads/

echo "📝 Permisos configurados correctamente"
echo ""
echo "Los archivos subidos se guardarán en: uploads/recursos/"
