// src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const cargaRoutes = require('./routes/cargaRoutes');
const reportRoutes = require('./routes/reportRoutes');
const { authenticateToken } = require('./middleware/authMiddleware');
const { uploadStudentsFile, getLoadStatus } = require('./controllers/uploadController');
const { startListener, stopListener, getListenerStatus } = require('./controllers/responseListenerController');

const app = express();
const PORT = process.env.PORT || 3001;

// ============ CORS MEJORADO ============
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============ MULTER MEJORADO ============
const upload = multer({
  dest: process.env.UPLOAD_DIR || 'uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Validar que sea un archivo Excel
    if (!file.originalname.match(/\.(xlsx|xls)$/i)) {
      console.log(`⚠️ Formato inválido: ${file.originalname}`);
      return cb(new Error('Formato inválido. Solo se aceptan .xlsx o .xls'), false);
    }
    console.log(`📄 Archivo recibido: ${file.originalname}`);
    cb(null, true);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/cargas', authenticateToken, cargaRoutes);
app.use('/api/report', authenticateToken, reportRoutes);

// ============ ENDPOINT DE UPLOAD CON MEJOR MANEJO DE ERRORES ============
app.post('/api/upload', authenticateToken, (req, res, next) => {
  console.log('📥 POST /api/upload - Recibida solicitud');
  
  // Aplicar multer
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('❌ Error de Multer:', err.message);
      return res.status(400).json({
        success: false,
        error: 'Error al procesar el archivo',
        code: 'MULTER_ERROR',
        details: err.message
      });
    } else if (err) {
      console.error('❌ Error:', err.message);
      return res.status(400).json({
        success: false,
        error: err.message,
        code: 'FILE_ERROR'
      });
    }
    
    // Si no hay archivo después de multer
    if (!req.file) {
      console.error('❌ No se recibió archivo');
      return res.status(400).json({
        success: false,
        error: 'No se ha subido ningún archivo.',
        code: 'NO_FILE',
        details: 'Envía el archivo con el campo "file" en FormData'
      });
    }
    
    // Continuar al controlador
    next();
  });
}, uploadStudentsFile);

app.post('/api/upload/response', authenticateToken, require('./controllers/uploadController').setStudentResponse);
app.get('/api/upload/status/:cargaId', authenticateToken, getLoadStatus);

// ============ ENDPOINTS DE ESCUCHA AUTOMÁTICA DE RESPUESTAS ============
app.post('/api/listener/start', authenticateToken, startListener);
app.post('/api/listener/stop', authenticateToken, stopListener);
app.get('/api/listener/status', authenticateToken, getListenerStatus);

// Test de conexión a BD
app.get('/api/test', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    res.json({ 
      success: true, 
      message: '✅ Conexión a BD verificada',
      timestamp: new Date().toISOString(),
      database: process.env.DB_NAME,
      port: PORT
    });
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Error en conexión a BD',
      details: error.message,
      hint: 'Verifica que MySQL está corriendo y la configuración en .env es correcta'
    });
  }
});

// Home
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sistema PAE - Backend</title>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 3px solid #007bff; padding-bottom: 10px; }
        .status { background: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; color: #155724; font-weight: bold; }
        h2 { color: #555; margin-top: 30px; }
        ul { background: #f9f9f9; padding: 20px 40px; border-left: 4px solid #007bff; }
        li { margin: 10px 0; font-family: monospace; }
        .code { background: #f4f4f4; padding: 10px; border-radius: 3px; display: inline-block; }
        .endpoint { color: #007bff; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎓 Sistema PAE - Backend</h1>
        <p>Sistema de carga masiva de estudiantes para acompañamiento estudiantil.</p>
        
        <div class="status">✅ Servidor funcionando correctamente en puerto ${PORT}</div>
        
        <h2>📡 Endpoints Disponibles</h2>
        <ul>
          <li><span class="endpoint">GET</span> <span class="code">/api/test</span> - Verificar conexión a BD</li>
          <li><span class="endpoint">POST</span> <span class="code">/api/upload</span> - Subir archivo Excel de estudiantes</li>
          <li><span class="endpoint">POST</span> <span class="code">/api/upload/response</span> - Informar respuesta manual (de correo)</li>
          <li><span class="endpoint">GET</span> <span class="code">/api/upload/status/:cargaId</span> - Ver estado de carga</li>
          <li><span class="endpoint">GET</span> <span class="code">/api/report</span> - Descargar reportes</li>
          <li><span class="endpoint">POST</span> <span class="code">/api/auth/login</span> - Iniciar sesión</li>
          <li><span class="endpoint">GET</span> <span class="code">/api/auth/me</span> - Obtener usuario autenticado</li>
          <li><span class="endpoint">GET</span> <span class="code">/api/cargas</span> - Listar cargas/subidas</li>
          <li><span class="endpoint">GET</span> <span class="code">/api/cargas/:cargaId/estudiantes</span> - Listar estudiantes de una carga</li>
          <li><span class="endpoint">PUT</span> <span class="code">/api/cargas/:cargaId/estudiantes/:estudianteCargaId</span> - Actualizar estado de un estudiante</li>
          <li style="margin-top: 15px; font-weight: bold; color: #28a745;">🔴 CAPTURA AUTOMÁTICA</li>
          <li><span class="endpoint">POST</span> <span class="code">/api/listener/start</span> - Iniciar escucha de respuestas</li>
          <li><span class="endpoint">POST</span> <span class="code">/api/listener/stop</span> - Detener escucha</li>
          <li><span class="endpoint">GET</span> <span class="code">/api/listener/status</span> - Ver estado de escucha</li>
        </ul>

        <h2>🧪 Pruebas Rápidas</h2>
        <p>Desde la terminal ejecuta:</p>
        <ul>
          <li><span class="code">curl http://localhost:${PORT}/api/test</span></li>
          <li><span class="code">curl -X POST -F "file=@estudiantes.xlsx" http://localhost:${PORT}/api/upload</span></li>
        </ul>

        <h2>📚 Documentación</h2>
        <p>Ver <span class="code">README.md</span> en la raíz del proyecto para instrucciones completas.</p>
      </div>
    </body>
    </html>
  `);
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    path: req.path,
    method: req.method,
    availableEndpoints: [
      'POST /api/auth/login',
      'GET /api/auth/me',
      'GET /api/cargas',
      'GET /api/cargas/:cargaId/estudiantes',
      'PUT /api/cargas/:cargaId/estudiantes/:estudianteCargaId',
      'POST /api/upload',
      'POST /api/upload/response',
      'GET /api/upload/status/:cargaId',
      'GET /api/report',
      'POST /api/listener/start',
      'POST /api/listener/stop',
      'GET /api/listener/status'
    ]
  });
});

app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║    🎓 Sistema PAE - Backend          ║');
  console.log('╠════════════════════════════════════════╣');
  console.log(`║ 🟢 Servidor: http://localhost:${PORT}`.padEnd(41) + '║');
  console.log('║ 📚 Documentación: ver README.md     ║');
  console.log('║ 🧪 Test: curl http://localhost:3001/api/test ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
});