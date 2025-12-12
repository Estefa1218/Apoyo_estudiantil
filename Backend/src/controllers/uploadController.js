// src/controllers/uploadController.js
const pool = require('../config/db');
const { parseExcelFile } = require('../utils/excelParser');

exports.uploadStudentsFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo.' });
    }

    const filePath = req.file.path;
    const data = parseExcelFile(filePath);
    const profesionalId = 1; // ← En producción, obtén del usuario autenticado

    // Insertar en Carga_Masiva
    const [result] = await pool.execute(
      `INSERT INTO Carga_Masiva (nombre_archivo, total_estudiantes, profesional_id) 
       VALUES (?, ?, ?)`,
      [req.file.originalname, data.length, profesionalId]
    );

    const cargaId = result.insertId;

    // Preparar datos para Estudiante_Carga (alineado con modelo relacional)
    const studentValues = data.map(row => [
      row.nombre_completo,   // nombre_completo
      row.email,             // email
      row.dias_ausente,      // dias_ausente
      cargaId,               // carga_id
      null,                  // estudiante_id (puede vincularse después)
      'pendiente',           // estado_seguimiento ← obligatorio
      new Date(),            // fecha_primer_intento ← como objeto Date
      0,                     // intentos_enviados ← obligatorio
      null,                  // fecha_respuesta
      null                   // motivo_respuesta
    ]);

    // Insertar en Estudiante_Carga
    await pool.execute(
      `INSERT INTO Estudiante_Carga (
        nombre_completo, 
        email, 
        dias_ausente, 
        carga_id, 
        estudiante_id,
        estado_seguimiento,
        fecha_primer_intento,
        intentos_enviados,
        fecha_respuesta,
        motivo_respuesta
      ) VALUES ?`,
      [studentValues]
    );

    res.status(201).json({
      message: 'Archivo procesado exitosamente',
      cargaId,
      estudiantes: data.length
    });
  } catch (error) {
    console.error('Error al procesar archivo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};