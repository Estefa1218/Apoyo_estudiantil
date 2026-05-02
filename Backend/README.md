# Sistema PAE - Backend

Sistema de carga masiva de estudiantes para acompañamiento estudiantil.

## 📋 Características

✅ **Mapeo flexible de columnas**: Detecta automáticamente columnas sin importar el nombre
✅ **Validación completa**: Valida nombres, emails y días de ausencia
✅ **Cálculo automático**: Calcula días desde última conexión
✅ **Transacciones**: Garantiza integridad de datos
✅ **Auditoría**: Registra cada evento de carga
✅ **Envío de emails**: Notificación automática a estudiantes
✅ **Manejo robusto de errores**: Con rollback automático

## 🚀 Instalación

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar base de datos

#### Crear base de datos
```bash
mysql -u root -p
```

```sql
CREATE DATABASE sistema_pae CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sistema_pae;
SOURCE sistema_pae.sql;
```

#### Verificar tablas creadas
```sql
SHOW TABLES;
DESCRIBE Carga_Masiva;
DESCRIBE Estudiante_Carga;
DESCRIBE Auditoria_Carga;
```

### 3. Configurar variables de entorno

Copiar el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```

Editar `.env` con tus valores:
```ini
# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=sistema_pae

# Correo (opcional para pruebas iniciales)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_app
EMAIL_FROM=tu_email@gmail.com

# Aplicación
NODE_ENV=development
PORT=3001
```

## 📊 Estructura de Base de Datos

### Tabla: Carga_Masiva
Almacena información de cada carga de archivo
- `carga_id`: ID único
- `nombre_archivo`: Nombre del Excel
- `total_estudiantes`: Cantidad de estudiantes válidos
- `profesional_id`: Quién hizo la carga
- `correos_enviados`: Emails enviados exitosamente
- `correos_fallidos`: Emails que fallaron
- `estado`: procesando | completado | fallido
- `fecha_carga`: Timestamp de creación

### Tabla: Estudiante_Carga
Almacena información de cada estudiante en la carga
- `nombre_completo`: Nombre del estudiante
- `email`: Email para notificación
- `dias_ausente`: Días de ausencia
- `estado_seguimiento`: pendiente | enviado | respondido | no_responde
- `intentos_enviados`: Contador de emails enviados
- `fecha_respuesta`: Cuándo respondió el estudiante
- `motivo_respuesta`: Por qué estaba ausente

### Tabla: Auditoria_Carga
Registro de todos los eventos
- `evento`: CARGA_INICIADA, CORREOS_ENVIADOS, ERROR_CORREOS, etc.
- `detalles`: JSON con información del evento
- `fecha_evento`: Timestamp del evento

## 🧪 Pruebas

### 1. Iniciar el servidor
```bash
npm run dev
```

Deber ver:
```
Servidor escuchando en puerto 3001
✅ Base de datos conectada
```

### 2. Crear archivo de prueba

Crear un Excel `test_estudiantes.xlsx` con las columnas:
- **Nombre Completo** (o "nombre" + "apellido" por separado)
- **Email**
- **Días Ausente** (o "Última Conexión" con fecha)

Ejemplo de datos:
```
| Nombre Completo | Email               | Días Ausente |
|-----------------|---------------------|--------------|
| Juan García     | juan@email.com      | 5            |
| María López     | maria@email.com     | 8            |
| Carlos Pérez    | carlos@email.com    | 3            |
```

### 3. Enviar archivo con cURL

```bash
curl -X POST http://localhost:3001/api/upload \
  -F "file=@test_estudiantes.xlsx"
```

### Respuesta esperada (200):
```json
{
  "success": true,
  "message": "Archivo procesado exitosamente",
  "cargaId": 1,
  "estadisticas": {
    "totalArchivo": 3,
    "procesados": 3,
    "ignorados": 0,
    "correos": {
      "enviados": 0,
      "fallidos": 0
    }
  },
  "detalles": {
    "archivo": "test_estudiantes.xlsx",
    "columnasDetectadas": {
      "nombre_completo": "Nombre Completo",
      "email": "Email",
      "dias_ausente": "Días Ausente"
    }
  }
}
```

### 4. Consultar estado de carga

```bash
curl http://localhost:3001/api/upload/status/1
```

Respuesta:
```json
{
  "carga": {
    "carga_id": 1,
    "nombre_archivo": "test_estudiantes.xlsx",
    "total_estudiantes": 3,
    "estado": "completado",
    "correos_enviados": 0,
    "correos_fallidos": 0
  },
  "estadisticas": {
    "total": 3,
    "pendiente": 3,
    "enviado": 0,
    "respondido": 0,
    "no_responde": 0
  },
  "auditoria": [
    {
      "evento": "CARGA_INICIADA",
      "detalles": {...},
      "fecha_evento": "2026-03-22T..."
    }
  ]
}
```

## ✅ Validaciones Realizadas

1. **Nombre Completo**
   - ✓ No puede estar vacío
   - ✓ Detecta múltiples formatos (nombre+apellido separados, nombre completo, etc.)

2. **Email**
   - ✓ Debe contener `@`
   - ✓ Longitud mínima de 6 caracteres
   - ✓ Se convierte a minúsculas

3. **Días de Ausencia**
   - ✓ Debe ser un número >= 0
   - ✓ Si solo hay fecha de última conexión, se calcula automáticamente
   - ✓ La fecha se normaliza correctamente

4. **Integridad de Datos**
   - ✓ Transacción ACID: todo se guarda juntos o nada
   - ✓ Prevención de duplicados con UNIQUE KEY
   - ✓ Rollback automático en caso de error

## 🐛 Manejo de Errores

### Archivo vacío
```json
{ "error": "El archivo Excel está vacío o no tiene datos válidos.", "code": "EMPTY_FILE" }
```

### Columnas faltantes
```json
{ 
  "error": "El archivo no contiene todas las columnas requeridas.",
  "missingColumns": ["email"],
  "availableColumns": ["Nombre", "Días Ausente"]
}
```

### Datos inválidos
```json
{
  "error": "No se encontraron datos válidos en el archivo.",
  "invalidRows": [
    { "fila": 2, "errores": ["Email inválido: juan@"] }
  ]
}
```

### Error de base de datos
```json
{
  "error": "Error al procesar el archivo",
  "code": "TRANSACTION_ERROR"
}
```
(El detalle del error solo aparece si NODE_ENV=development)

## 📝 Logs del Sistema

El servidor imprime logs detallados:
```
📥 Recibiendo solicitud de carga de archivo...
📄 Archivo recibido: test.xlsx (12345 bytes)
📊 Datos leídos: 100 filas
🏷️ Encabezados detectados: Nombre, Email, Días Ausente
✅ Columnas mapeadas: { nombre_completo: "Nombre", ... }
✅ Datos válidos: 98
❌ Filas inválidas: 2
  Fila 3: Email inválido
  Fila 5: Nombre vacío
📋 Carga registrada: ID 1
✅ 98 estudiantes insertados
✅ Transacción confirmada
📧 Iniciando envío inmediato...
✅ Correo enviado a: juan@email.com
```

## 🔍 Pruebas de Casos Especiales

### Case 1: Nombre y Apellido Separados
```
| Nombre    | Apellido | Email          | Días Ausente |
|-----------|----------|----------------|--------------|
| Juan      | García   | juan@email.com | 5            |
```
✅ Se combinan automáticamente → "Juan García"

### Case 2: Última Conexión Como Fecha
```
| Nombre Completo | Email               | Última Conexión |
|-----------------|---------------------|-----------------|
| Juan García     | juan@email.com      | 2026-03-15      |
```
✅ Se calcula automáticamente → 7 días de ausencia (si hoy es 2026-03-22)

### Case 3: Variaciones de Nombre de Columna
```
| Full Name       | correo electronico | Days Absent |
|-----------------|-------------------|-----------|
| Juan García     | juan@email.com    | 5         |
```
✅ Detecta variaciones (Full Name ≈ Nombre Completo, correo electronico ≈ Email, etc.)

### Case 4: Errores Parciales
Si 5 de 100 filas tienen errores:
```json
{
  "success": true,
  "message": "Archivo procesado exitosamente",
  "estadisticas": {
    "procesados": 95,
    "ignorados": 5
  },
  "invalidRows": [
    { "fila": 3, "errores": ["Email inválido"] },
    ...
  ]
}
```
✅ Las 95 filas válidas se guardan, las 5 inválidas se reportan

## 🚨 Troubleshooting

### Error: "Base de datos conectada"
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solución**: Asegúrate que MySQL está corriendo
```bash
# Windows
net start MySQL80

# macOS
brew services start mysql

# Linux
sudo systemctl start mysql
```

### Error: "Table doesn't exist"
```
Error: Table 'sistema_pae.Carga_Masiva' doesn't exist
```
**Solución**: Ejecutar el SQL
```bash
mysql -u root -p sistema_pae < sistema_pae.sql
```

### Error: "Email de prueba no se envía"
Si no ves emails pero la carga completó con `correos_enviados: 0`:
- Verifica que EMAIL_HOST, EMAIL_USER, EMAIL_PASS están configurados en `.env`
- Para Gmail, usa [contraseña de aplicación](https://myaccount.google.com/apppasswords)
- Mientras debugueas, puedes comentar el envío de emails (no es obligatorio)

### Auditoría vacía
Si la auditoría no tiene registros:
- Verifica que la tabla Auditoria_Carga fue creada:
```sql
SHOW TABLES LIKE '%uditoria%';
```

## 📞 Contacto

Para reportar problemas o sugerencias, por favor abre un issue en el repositorio.
