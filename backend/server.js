// backend/server.js
const express = require('express');
const cors = require('cors');
const uploadRoutes = require('./routes/upload');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', // Vite default port
    'http://localhost:5173', // Vite development port
    'http://localhost:8080', // Alternative dev port
    'http://localhost:80',    // Local development
    'http://localhost:4173'   // Vite preview port
  ],
  credentials: true
})); // permite peticiones desde React
app.use(express.json({ limit: '10mb' }));

// Serve static files
app.use('/uploads', express.static('uploads')); // Para servir archivos subidos si es necesario

// Rutas
app.use('/api', uploadRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Backend de Acompañamiento Estudiantil funcionando ✅');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});