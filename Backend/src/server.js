// src/server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const reportRoutes = require('./routes/reportRoutes');
const { uploadStudentsFile } = require('./controllers/uploadController');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.use('/api/report', reportRoutes);
app.post('/api/upload', upload.single('file'), uploadStudentsFile);

app.get('/api/test', (req, res) => {
  res.json({ message: '✅ Backend funcionando' });
});

app.listen(PORT, () => {
  console.log(`🟢 Servidor en http://localhost:${PORT}`);
});