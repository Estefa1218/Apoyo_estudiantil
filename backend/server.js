// backend/server.js
const express = require('express');
const cors = require('cors');
const uploadRoutes = require('./routes/upload');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // permite peticiones desde React (localhost:3000)
app.use(express.json({ limit: '10mb' }));

// Rutas
app.use('/api', uploadRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Backend de Acompañamiento Estudiantil funcionando ✅');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});