# 🔴 GUÍA: Captura Automática de Respuestas por Email

## Sistema de Escucha Automática via IMAP

El backend ahora puede escuchar automáticamente las respuestas de los estudiantes a los correos de acompañamiento.

---

## 📋 PASO 1: Habilitar Acceso IMAP en Gmail

### Requisitos:
- [x] Tu email: estefanializgon@gmail.com
- [x] Contraseña de aplicación generada (ya la tienes)

### Pasos en Gmail:

1. ve a: **https://myaccount.google.com/security**
2. En el panel izquierdo, haz clic en **"Seguridad"**
3. Desplázate a **"Contraseñas de aplicación"** (requiere autenticación 2FA)
4. Si no tiene 2FA habilitado:
   - Haz clic en **"Verificación en 2 pasos"**
   - Completa el proceso
   - Vuelve a "Contraseñas de aplicación"

5. Selecciona:
   - Aplicación: **Correo**
   - Dispositivo: **Otras (Windows)**
   
6. Google generará una contraseña de 16 caracteres. **Cópiala**.

---

## ⚙️ PASO 2: Configurar Variables de Entorno

Abre `.env` y asegúrate que tiene:

```env
# Email SMTP (para enviar)
EMAIL_USER=estefanializgon@gmail.com
EMAIL_PASS=tu_contraseña_de_app_de_16_caracteres

# Las mismas credenciales funcionan para IMAP (para recibir)
```

Ejemplo completo:
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=milo2003
DB_NAME=sistema_pae
PORT=3001

EMAIL_USER=estefanializgon@gmail.com
EMAIL_PASS=xyz wxyz wxyz wxyz   # (sin espacios reales)
```

---

## 📦 PASO 3: Instalar Dependencias

Abre PowerShell en la carpeta Backend y ejecuta:

```powershell
cd "C:\Users\estef\OneDrive\Escritorio\Ausentimo\Backend"
npm install
```

Esto instalará las nuevas librerías:
- `imap` - Protocolo IMAP para leer correos
- `mailparser` - Parsear contenido de emails

---

## 🚀 PASO 4: Usar el Sistema

### A. Iniciar Backend

```powershell
npm run dev
```

El servidor estará en `http://localhost:3001`

### B. Iniciar Escucha de Respuestas

Desde terminal, PowerShell o postman:

```bash
# Iniciar
curl -X POST http://localhost:3001/api/listener/start

# Ver estado
curl http://localhost:3001/api/listener/status

# Detener
curl -X POST http://localhost:3001/api/listener/stop
```

**Respuesta de ejemplo:**
```json
{
  "success": true,
  "message": "✅ Servicio de captura de respuestas iniciado",
  "status": {
    "isRunning": true,
    "timestamp": "2026-03-22T14:30:45.123Z",
    "emailUser": "estefanializgon@gmail.com"
  }
}
```

---

## 🔄 ¿Cómo Funciona?

### Flujo Automático:

1. **Backend inicia** ➜ Se conecta a Gmail vía IMAP
2. **Escucha INBOX** ➜ Detecta nuevos correos
3. **Identifica respuestas** ➜ Busca "Re:" y headers de respuesta
4. **Extrae email** ➜ Obtiene quién respondió
5. **Busca estudiante** ➜ Consulta DB con ese email
6. **Guarda respuesta** ➜ Actualiza `Estudiante_Carga` con:
   - `estado_seguimiento = 'respondido'`
   - `fecha_respuesta = hoy`
   - `motivo_respuesta = primer párrafo del email`
7. **Registra en auditoría** ➜ Crea evento `RESPUESTA_AUTOMATICA`
8. **Marca como leído** ➜ El email se maraca como leído en Gmail

---

## 📊 Resultado en Base de Datos

Cuando un estudiante responde:

**Tabla: Estudiante_Carga**
```
| email                  | estado_seguimiento | fecha_respuesta | motivo_respuesta              |
|------------------------|-------------------|-----------------|-------------------------------|
| juan@dominio.com       | respondido        | 2026-03-22      | Hola, estoy mejorando...     |
| maria@dominio.com      | enviado           | NULL            | NULL                          |
```

**Tabla: Auditoria_Carga**
```
| evento                | detalles                      | fecha_evento        |
|----------------------|-------------------------------|-------------------|
| RESPUESTA_AUTOMATICA | {email, asunto, resumen}     | 2026-03-22 14:30  |
```

---

## ✅ Verificar Funcionamiento

### 1. Ver logs en consola
Cuando se inicia, verás:
```
✅ INBOX abierto. Escuchando respuestas...
📧 Nuevo correo detectado (cuando llega uno)
```

### 2. Ver en Base de Datos
```sql
SELECT email, estado_seguimiento, fecha_respuesta 
FROM Estudiante_Carga 
WHERE estado_seguimiento = 'respondido'
ORDER BY fecha_respuesta DESC;
```

### 3. Descargar Reporte
Usa la interfaz:
- Selecciona fechas
- Descarga el Excel
- Verá hoja "Respondidos" con las respuestas capturadas

---

## 🛠️ Solución de Problemas

### Error: "IMAP no inicializado"
➜ El servicio no se inició. Ejecuta: `POST /api/listener/start`

### No detecta respuestas
➜ Asegúrate que:
- El correo está **respondiendo al email que envió el sistema**
- El asunto contiene **"Re:"** o es un hilo de conversación
- El email del estudiante coincide exactamente con la BD

### Error: "credentials error"
➜ Verifica:
- `EMAIL_USER` y `EMAIL_PASS` en .env son correctos
- La contraseña es la de **aplicación específica**, no la de Gmail normal
- Gmail tiene **2FA habilitado**

### IMAP se desconecta constantemente
➜ Agrega a .env:
```env
IMAP_KEEPALIVE=true
```

---

## 💾 Resumen de Cambios

**Archivos creados:**
- `src/services/emailResponseService.js` - Lógica de IMAP y captura
- `src/controllers/responseListenerController.js` - Endpoints de control

**Archivos modificados:**
- `src/server.js` - Agregados endpoints `/api/listener/*`
- `package.json` - Agregadas dependencias imap y mailparser

**Variables de entorno necesarias:**
- `EMAIL_USER` ✅ (ya configurado)
- `EMAIL_PASS` ✅ (ya configurado)

---

## 📞 Endpoints Disponibles

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| POST | `/api/listener/start` | Iniciar captura automática |
| POST | `/api/listener/stop` | Detener captura |
| GET | `/api/listener/status` | Ver si está activo |

---

**¿Listo? Prosigue con:**
1. ✅ Instala dependencias: `npm install`
2. ✅ Inicia backend: `npm run dev`
3. ✅ Inicia listener: `curl -X POST http://localhost:3001/api/listener/start`
4. ✅ Envía correos a estudiantes y espera respuestas
5. ✅ Descarga reportes para verificar
