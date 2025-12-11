// backend/controllers/uploadController.js
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const handleUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    // Leer el buffer del archivo Excel
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Validar que la primera fila tenga los encabezados esperados
    const headers = jsonData[0] || [];
    const expectedHeaders = ['nombre', 'correo', 'dias_ausente']; // en minúsculas para comparar

    const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
    if (!expectedHeaders.every(h => normalizedHeaders.includes(h))) {
      return res.status(400).json({
        error: 'El archivo debe contener las columnas: nombre, correo, dias_ausente'
      });
    }

    // Encontrar índices de las columnas
    const nameIndex = normalizedHeaders.findIndex(h => h === 'nombre');
    const emailIndex = normalizedHeaders.findIndex(h => h === 'correo');
    const daysIndex = normalizedHeaders.findIndex(h => h === 'dias_ausente');

    // Extraer datos (omitir la primera fila)
    const students = [];
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (row.length === 0) continue; // saltar filas vacías

      const name = row[nameIndex]?.toString().trim();
      const email = row[emailIndex]?.toString().trim();
      const days = parseInt(row[daysIndex]);

      if (name && email && !isNaN(days)) {
        students.push({ name, email, days });
      }
    }

    if (students.length === 0) {
      return res.status(400).json({ error: 'No se encontraron datos válidos en el archivo' });
    }

    // === GUARDAR EN BASE DE DATOS ===

    // 1. Insertar en Carga_Masiva
    const [cargaResult] = await db.execute(
      'INSERT INTO Carga_Masiva (nombre_archivo, total_estudiantes, profesional_id) VALUES (?, ?, ?)',
      [req.file.originalname, students.length, 1] // profesional_id = 1 por ahora (puedes cambiarlo)
    );
    const cargaId = cargaResult.insertId;

    // 2. Insertar cada estudiante en Estudiante_Carga
    for (const student of students) {
      await db.execute(
        `INSERT INTO Estudiante_Carga 
        (nombre_completo, email, dias_ausente, carga_id, fecha_primer_intento) 
        VALUES (?, ?, ?, ?, CURDATE())`,
        [student.name, student.email, student.days, cargaId]
      );
    }

    // === GENERAR ARCHIVO PROCESADO (si es necesario) ===
    // Crear directorio uploads si no existe
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Crear un nuevo libro de trabajo para el archivo procesado
    const processedWorkbook = XLSX.utils.book_new();
    const processedWorksheet = XLSX.utils.json_to_sheet(students);
    XLSX.utils.book_append_sheet(processedWorkbook, processedWorksheet, 'Estudiantes Procesados');
    
    // Generar el nombre del archivo procesado
    const originalFileName = path.parse(req.file.originalname).name;
    const processedFileName = `${originalFileName}_procesado.xlsx`;
    const processedFilePath = path.join(uploadDir, processedFileName);
    
    // Escribir el archivo procesado
    XLSX.writeFile(processedWorkbook, processedFilePath);

    // === RESPUESTA ===
    res.status(200).json({
      message: 'Archivo procesado exitosamente',
      cargaId: cargaId,
      totalEstudiantes: students.length,
      processedData: students,  // Devolver los datos procesados si se necesitan en el frontend
      processedFileName: processedFileName // Nombre del archivo procesado para descarga
    });

  } catch (error) {
    console.error('Error en handleUpload:', error);
    res.status(500).json({ error: 'Error al procesar el archivo' });
  }
};

// Función para descargar archivo procesado
const handleDownload = async (req, res) => {
  try {
    const { fileName } = req.params;
    
    // Verificar que el nombre de archivo sea seguro
    if (!fileName || fileName.includes('..') || fileName.includes('/')) {
      return res.status(400).json({ error: 'Nombre de archivo inválido' });
    }
    
    const filePath = path.join(__dirname, '../uploads', fileName);
    
    // Verificar que el archivo exista
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    // Enviar el archivo como descarga
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error enviando archivo:', err);
        res.status(500).json({ error: 'Error al enviar el archivo' });
      }
    });
  } catch (error) {
    console.error('Error en handleDownload:', error);
    res.status(500).json({ error: 'Error al descargar el archivo' });
  }
};

module.exports = { handleUpload, handleDownload };