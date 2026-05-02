# 🚀 Guía de Ejecución y Pruebas - Sistema PAE

## ⭐ Inicio Rápido (5 minutos)

### 1️⃣ Instalación de dependencias

```bash
# Ir al directorio del backend
cd Backend

# Instalar todas las dependencias
npm install
```

**Resultado esperado:**
```
added 156 packages in 2.4s
```

---

## 🗄️ 2️⃣ Configuración de Base de Datos

### Verificar que MySQL está corriendo

**Windows:**
```bash
# Abrir PowerShell o CMD como administrador
net start MySQL80
```

**macOS:**
```bash
brew services start mysql
```

**Linux:**
```bash
sudo systemctl start mysql
```

### Crear la base de datos

```bash
# Abrir MySQL
mysql -u root -p

# Cuando pida contraseña, escribe tu contraseña de MySQL (ej: milo2003)
```

Una vez dentro de MySQL:
```sql
-- Ejecutar el script de creación
SOURCE sistema_pae.sql;

-- Verificar que se crearon las tablas
SHOW TABLES;
-- Deberías ver: Auditoria_Carga, Carga_Masiva, Estudiante, Estudiante_Carga, Profesional

-- Salir
EXIT;
```

---

## 🔐 3️⃣ Verificar Configuración de .env

Abre el archivo `.env` y verifica:

```ini
# Base de datos (debe coincidir con tu MySQL)
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=milo2003        # Tu contraseña real
DB_NAME=sistema_pae

# Correo (opcional para pruebas iniciales)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=estefanializgon@gmail.com
EMAIL_PASS=Katyuska1812     # Contraseña de app de Gmail
EMAIL_FROM=notificaciones@tuinstituto.edu

# Puerto
PORT=3001
```

**⚠️ Importante:**
- Si introduces credenciales reales, **NO** las compartas en git
- Para Gmail, necesitas [Contraseña de Aplicación](https://myaccount.google.com/apppasswords)

---

## ✅ 4️⃣ Ejecutar el Servidor

```bash
# Desde la carpeta Backend
npm run dev
```

**Deberías ver:**
```
╔════════════════════════════════════════╗
║    🎓 Sistema PAE - Backend          ║
╠════════════════════════════════════════╣
║ 🟢 Servidor: http://localhost:3001  ║
║ 📚 Documentación: ver README.md     ║
║ 🧪 Test: curl http://localhost:3001/api/test ║
╚════════════════════════════════════════╝
```

✅ El servidor está listo para recibir solicitudes

---

## 🧪 5️⃣ Pruebas

### Opción A: Usando curl (Terminal)

#### Test 1: Verificar conexión a BD

```bash
curl http://localhost:3001/api/test
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "✅ Conexión a BD verificada",
  "timestamp": "2026-03-22T14:30:45.123Z",
  "database": "sistema_pae",
  "port": 3001
}
```

#### Test 2: Visitar la página principal

```bash
# En el navegador: http://localhost:3001
```

Deberías ver una página HTML con información sobre los endpoints.

#### Test 3: Subir un archivo Excel

**Preparar archivo de prueba:**

Crea un archivo `test_estudiantes.xlsx` con estas columnas:

```
| Nombre Completo | Email                | Días Ausente |
|-----------------|----------------------|--------------|
| Juan García     | juan.garcia@mail.com | 5            |
| María López     | maria.lopez@mail.com | 8            |
| Carlos Pérez    | carlos.perez@mail.com| 3            |
```

**Subir el archivo:**

```bash
curl -X POST -F "file=@test_estudiantes.xlsx" http://localhost:3001/api/upload
```

**Respuesta exitosa:**
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

**Nota:** `cargaId": 1` es importante para el siguiente test

#### Test 4: Ver estado de carga

```bash
curl http://localhost:3001/api/upload/status/1
```

**Respuesta esperada:**
```json
{
  "carga": {
    "carga_id": 1,
    "nombre_archivo": "test_estudiantes.xlsx",
    "total_estudiantes": 3,
    "profesional_id": 1,
    "correos_enviados": 0,
    "correos_fallidos": 0,
    "fecha_carga": "2026-03-22T14:35:20.000Z",
    "estado": "completado"
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
      "detalles": "...",
      "fecha_evento": "2026-03-22T14:35:20.000Z"
    }
  ]
}
```

---

### Opción B: Usando Postman

1. **Descargar Postman:** https://www.postman.com/downloads/
2. **Importar ejemplos:**

#### Request 1: GET /api/test
- URL: `http://localhost:3001/api/test`
- Método: GET
- Click en Send
- **Esperado:** Status 200 con JSON

#### Request 2: POST /api/upload
- URL: `http://localhost:3001/api/upload`
- Método: POST
- Ir a "Body" → "form-data"
- Añadir campo:
  - Key: `file`
  - Value: Seleccionar archivo `test_estudiantes.xlsx`
- Click en Send
- **Esperado:** Status 201 con JSON de carga

#### Request 3: GET /api/upload/status/1
- URL: `http://localhost:3001/api/upload/status/1`
- Método: GET
- Click en Send
- **Esperado:** Status 200 con detalles de la carga

---

## 🧠 Pruebas de Casos Especiales

### Caso 1: Archivo con Nombre y Apellido Separados

**test_nombres_separados.xlsx:**
```
| Nombre    | Apellido | Email            | Días Ausente |
|-----------|----------|------------------|--------------|
| Juan      | García   | juan@email.com   | 5            |
| María     | López    | maria@email.com  | 8            |
```

```bash
curl -X POST -F "file=@test_nombres_separados.xlsx" \
  http://localhost:3001/api/upload
```

**Esperado:** Se combinan automáticamente → "Juan García", "María López"

---

### Caso 2: Archivo con Última Conexión (Fecha)

**test_fecha_conexion.xlsx:**
```
| Nombre Completo | Email                | Última Conexión |
|-----------------|----------------------|-----------------|
| Juan García     | juan.garcia@mail.com | 2026-03-15      |
| María López     | maria.lopez@mail.com | 2026-03-10      |
```

```bash
curl -X POST -F "file=@test_fecha_conexion.xlsx" \
  http://localhost:3001/api/upload
```

**Esperado:** Se calcula automáticamente:
- Juan: 7 días de ausencia (22 - 15)
- María: 12 días de ausencia (22 - 10)

---

### Caso 3: Variaciones de Nombres de Columna

**test_variaciones.xlsx:**
```
| Full Name       | correo electronico | Days Absent |
|-----------------|-------------------|-----------|
| Juan García     | juan@email.com    | 5         |
| María López     | maria@email.com   | 8         |
```

```bash
curl -X POST -F "file=@test_variaciones.xlsx" \
  http://localhost:3001/api/upload
```

**Esperado:** Se detectan las variaciones correctamente

---

### Caso 4: Errores Parciales

**test_errores.xlsx:**
```
| Nombre Completo | Email          | Días Ausente |
|-----------------|----------------|--------------|
| Juan García     | juan@email.com | 5            |
| María López     | (vacío)        | 8            | <- falta email
| Carlos Pérez    | invalido.email | 3            | <- email sin @
```

```bash
curl -X POST -F "file=@test_errores.xlsx" \
  http://localhost:3001/api/upload
```

**Esperado:** Status 400 con detalles:
```json
{
  "success": false,
  "error": "No se encontraron datos válidos en el archivo.",
  "invalidRows": [
    {
      "fila": 3,
      "errores": ["Email es requerido"]
    },
    {
      "fila": 4,
      "errores": ["Email inválido: invalido.email"]
    }
  ]
}
```

---

## 🔍 Verificar Base de Datos Directamente

Mientras el servidor está corriendo, puedes revisar los datos guardados:

```bash
mysql -u root -p
USE sistema_pae;

# Ver cargas realizadas
SELECT * FROM Carga_Masiva;

# Ver estudiantes de una carga
SELECT * FROM Estudiante_Carga WHERE carga_id = 1;

# Ver auditoría
SELECT * FROM Auditoria_Carga WHERE carga_id = 1;
```

---

## 🐛 Troubleshooting

### Error: "ECONNREFUSED 127.0.0.1:3306"
**Problema:** MySQL no está corriendo
**Solución:**
```bash
# Windows
net start MySQL80

# macOS
brew services start mysql

# Linux
sudo systemctl start mysql
```

---

### Error: "Table doesn't exist"
**Problema:** La BD no fue creada
**Solución:**
```bash
mysql -u root -p sistema_pae < sistema_pae.sql
```

---

### Error: "Access denied for user"
**Problema:** Credenciales incorrectas en `.env`
**Solución:**
1. Verifica la contraseña en `.env`
2. Prueba la conexión directamente:
```bash
mysql -h 127.0.0.1 -u root -p
```

---

### Emails no se envían
**Problema:** Configuración incompleta
**Soluciones:**
1. Verifica las credenciales en `.env`
2. Para Gmail, vea https://myaccount.google.com/apppasswords
3. Para pruebas, puedes comentar el envío de emails

---

## ✨ Próximos Pasos

Una vez todo funciona:

- [ ] Implementar autenticación de usuarios
- [ ] Crear frontend para la interfaz del usuario
- [ ] Configurar envío de emails en producción
- [ ] Agregar más reportes y análisis
- [ ] Implementar notificaciones en tiempo real

---

## 📞 Cuando Necesites Ayuda

✅ Verifica el README.md para documentación completa
✅ Revisa los logs de la terminal para errores específicos
✅ Comprueba la conexión a BD con `/api/test`
✅ Verifica que archivos Excel tienen formato correcto

---

**¡Listo para hacer pruebas! 🚀**
