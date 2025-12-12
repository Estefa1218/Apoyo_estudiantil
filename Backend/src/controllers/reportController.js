// src/controllers/reportController.js
const XLSX = require('xlsx');
const pool = require('../config/db');

// Convierte DD-MM-YYYY → YYYY-MM-DD
function parseDateToMySQL(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

module.exports.downloadReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Fechas requeridas: startDate y endDate' });
    }

    const mysqlStartDate = parseDateToMySQL(startDate);
    const mysqlEndDate = parseDateToMySQL(endDate);

    if (!mysqlStartDate || !mysqlEndDate) {
      return res.status(400).json({ error: 'Formato de fecha inválido. Use DD-MM-YYYY.' });
    }

    const [rows] = await pool.execute(
      `SELECT 
        ec.nombre_completo,
        ec.email,
        ec.dias_ausente,
        ec.estado_seguimiento,
        ec.fecha_respuesta,
        ec.motivo_respuesta,
        cm.fecha_carga,
        p.nombre_programa
      FROM Estudiante_Carga ec
      JOIN Carga_Masiva cm ON ec.carga_id = cm.carga_id
      LEFT JOIN Estudiante e ON ec.email = e.email_institucional
      LEFT JOIN Programa p ON e.programa_id = p.programa_id
      WHERE cm.fecha_carga BETWEEN ? AND ?`,
      [mysqlStartDate, mysqlEndDate]
    );

    const workbook = XLSX.utils.book_new();

    const respondidos = rows.filter(row => row.estado_seguimiento === 'respondido');
    const ws1 = XLSX.utils.json_to_sheet(respondidos);
    XLSX.utils.book_append_sheet(workbook, ws1, 'Respondidos');

    const noContactados = rows.filter(row => row.estado_seguimiento === 'no_contactado');
    const ws2 = XLSX.utils.json_to_sheet(noContactados);
    XLSX.utils.book_append_sheet(workbook, ws2, 'No Contactados');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="reporte_${startDate}_a_${endDate}.xlsx"`);
    res.send(buffer);
  } catch (error) {
    console.error('Error al generar reporte:', error);
    res.status(500).json({ error: 'Error al generar el reporte' });
  }
};