#!/bin/bash

# Script para verificar y ejecutar el Backend del Sistema PAE

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║   📋 Verificación de Requisitos - Sistema PAE          ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0

# Función para verificar
check() {
  local name=$1
  local command=$2
  
  if eval "$command" > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC} $name"
    ((PASS++))
  else
    echo -e "${RED}❌${NC} $name"
    ((FAIL++))
  fi
}

# Verificaciones
echo "Verificando requisitos..."
echo ""

check "Node.js instalado" "node --version"
check "npm instalado" "npm --version"
check "MySQL corriendo" "mysql -u root -p$DB_PASSWORD -e 'SELECT 1' 2>/dev/null || ping -c 1 localhost &>/dev/null"

echo ""
echo "Verificando archivos del proyecto..."
echo ""

check "package.json existe" "[ -f package.json ]"
check ".env existe" "[ -f .env ]"
check "src/server.js existe" "[ -f src/server.js ]"
check "src/controllers/uploadController.js existe" "[ -f src/controllers/uploadController.js ]"
check "src/utils/columnMapper.js existe" "[ -f src/utils/columnMapper.js ]"
check "src/config/db.js existe" "[ -f src/config/db.js ]"

echo ""
echo "Verificando dependencias instaladas..."
echo ""

if [ -d "node_modules" ]; then
  echo -e "${GREEN}✅${NC} node_modules existe"
  ((PASS++))
else
  echo -e "${YELLOW}⚠️${NC} node_modules no existe - ejecuta: npm install"
  ((FAIL++))
fi

echo ""
echo "════════════════════════════════════════════════════════"
echo "Resultados: ${GREEN}$PASS pasadas${NC} | ${RED}$FAIL fallos${NC}"
echo "════════════════════════════════════════════════════════"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}✅ Todo listo para ejecutar${NC}"
  echo ""
  echo "Próximos pasos:"
  echo "1. Asegúrate de que MySQL está corriendo"
  echo "2. Ejecuta: npm run dev"
  echo "3. Prueba en: http://localhost:3001"
  echo ""
else
  echo -e "${RED}❌ Hay problemas que resolver${NC}"
  echo ""
  echo "Para instalar dependencias:"
  echo "  npm install"
  echo ""
  echo "Para configurar base de datos:"
  echo "  mysql -u root -p < sistema_pae.sql"
  echo ""
fi
