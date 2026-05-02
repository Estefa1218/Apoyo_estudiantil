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

function buildDateRangeBounds(startDate, endDate) {
  const start = parseDateToMySQL(startDate);
  const end = parseDateToMySQL(endDate);
  if (!start || !end) return null;
  // inicio 00:00:00, fin 23:59:59 del mismo dia para incluir todas las filas del dia.
  return {
    startRange: `${start} 00:00:00`,
    endRange: `${end} 23:59:59`
  };
}

module.exports.getReportStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    console.log('GET /api/report/stats', { startDate, endDate });

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Fechas requeridas: startDate y endDate' });
    }

    const bounds = buildDateRangeBounds(startDate, endDate);
    if (!bounds) {
      return res.status(400).json({ error: 'Formato de fecha inválido. Use DD-MM-YYYY.' });
    }

    const [rows] = await pool.execute(
      `SELECT 
        ec.estado_seguimiento
      FROM Estudiante_Carga ec
      JOIN Carga_Masiva cm ON ec.carga_id = cm.carga_id
      WHERE cm.fecha_carga BETWEEN ? AND ?`,
      [bounds.startRange, bounds.endRange]
    );

    const contacted = rows.filter(row => row.estado_seguimiento === 'respondido').length;
    const notContacted = rows.filter(row => ['pendiente', 'enviado', 'no_responde'].includes(row.estado_seguimiento)).length;

    return res.status(200).json({
      contacted: contacted || 0,
      notContacted: notContacted || 0,
      total: rows.length
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

module.exports.downloadReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    console.log('GET /api/report', { startDate, endDate });

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Fechas requeridas: startDate y endDate' });
    }

    const bounds = buildDateRangeBounds(startDate, endDate);
    if (!bounds) {
      return res.status(400).json({ error: 'Formato de fecha inválido. Use DD-MM-YYYY.' });
    }

    const [rows] = await pool.execute(
      `SELECT 
        ec.nombre_completo,
        ec.email,
        ec.dias_ausente,
        ec.estado_seguimiento,
        ec.intentos_enviados,
        ec.fecha_respuesta,
        ec.motivo_respuesta,
        cm.fecha_carga,
        p.nombre_programa
      FROM Estudiante_Carga ec
      JOIN Carga_Masiva cm ON ec.carga_id = cm.carga_id
      LEFT JOIN Estudiante e ON ec.email = e.email_institucional
      LEFT JOIN Programa p ON e.programa_id = p.programa_id
      WHERE cm.fecha_carga BETWEEN ? AND ?`,
      [bounds.startRange, bounds.endRange]
    );

    const workbook = XLSX.utils.book_new();

    const respondidos = rows.filter(row => row.estado_seguimiento === 'respondido');
    const respondidosData = respondidos.length > 0 ? respondidos : [{ mensaje: 'No hay registros respondidos para este rango.' }];
    const ws1 = XLSX.utils.json_to_sheet(respondidosData);
    XLSX.utils.book_append_sheet(workbook, ws1, 'Respondidos');

    const noContactados = rows.filter(row => ['pendiente', 'enviado', 'no_responde'].includes(row.estado_seguimiento));
    const noContactadosData = noContactados.length > 0 ? noContactados : [{ mensaje: 'No hay registros no contactados para este rango.' }];
    const ws2 = XLSX.utils.json_to_sheet(noContactadosData);
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