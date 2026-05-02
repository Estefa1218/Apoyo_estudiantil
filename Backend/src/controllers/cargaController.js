const pool = require('../config/db');

const validStates = ['pendiente', 'enviado', 'respondido', 'no_responde'];

function parseDateToMySQL(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;

  if (parts[0].length === 4) {
    return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
  }

  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function buildDateRangeQuery(startDate, endDate) {
  const start = parseDateToMySQL(startDate);
  const end = parseDateToMySQL(endDate);

  if (!start || !end) {
    return null;
  }

  return {
    sql: 'WHERE cm.fecha_carga BETWEEN ? AND ?',
    params: [`${start} 00:00:00`, `${end} 23:59:59`]
  };
}

async function registrarAuditoria(cargaId, evento, detalles = null) {
  try {
    await pool.execute(
      `INSERT INTO Auditoria_Carga (carga_id, evento, detalles)
       VALUES (?, ?, ?)`,
      [cargaId, evento, detalles ? JSON.stringify(detalles) : null]
    );
  } catch (error) {
    console.warn('⚠️ Error al registrar auditoría:', error.message);
  }
}

exports.getCargas = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let sql = `SELECT cm.carga_id, cm.nombre_archivo, cm.total_estudiantes, cm.correos_enviados, cm.correos_fallidos,
      cm.fecha_carga, cm.estado, p.nombre_completo AS profesional
      FROM Carga_Masiva cm
      JOIN Profesional p ON cm.profesional_id = p.profesional_id`;
    const params = [];

    if (startDate && endDate) {
      const range = buildDateRangeQuery(startDate, endDate);
      if (!range) {
        return res.status(400).json({
          success: false,
          error: 'Formato de fecha inválido. Use DD-MM-YYYY o YYYY-MM-DD.'
        });
      }
      sql += ` ${range.sql}`;
      params.push(...range.params);
    }

    sql += ' ORDER BY cm.fecha_carga DESC';

    const [rows] = await pool.execute(sql, params);
    return res.json({ success: true, cargas: rows });
  } catch (error) {
    console.error('Error al obtener cargas:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Error interno al obtener cargas',
      details: error.message
    });
  }
};

exports.getCargaStudents = async (req, res) => {
  const { cargaId } = req.params;

  if (!cargaId) {
    return res.status(400).json({
      success: false,
      error: 'cargaId es obligatorio'
    });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT estudiante_carga_id, nombre_completo, email, dias_ausente, estado_seguimiento,
        fecha_primer_intento, intentos_enviados, fecha_respuesta, motivo_respuesta, fecha_creacion
       FROM Estudiante_Carga
       WHERE carga_id = ?
       ORDER BY nombre_completo ASC`,
      [cargaId]
    );

    return res.json({
      success: true,
      cargaId,
      estudiantes: rows
    });
  } catch (error) {
    console.error('Error al obtener estudiantes de carga:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Error interno al obtener estudiantes',
      details: error.message
    });
  }
};

exports.updateStudentStatus = async (req, res) => {
  const { cargaId, estudianteCargaId } = req.params;
  const { estado_seguimiento, motivo_respuesta, fecha_respuesta } = req.body;

  if (!cargaId || !estudianteCargaId) {
    return res.status(400).json({
      success: false,
      error: 'cargaId y estudianteCargaId son obligatorios'
    });
  }

  if (!estado_seguimiento || !validStates.includes(estado_seguimiento)) {
    return res.status(400).json({
      success: false,
      error: `estado_seguimiento inválido. Valores permitidos: ${validStates.join(', ')}`
    });
  }

  const fechaResp = fecha_respuesta ? new Date(fecha_respuesta) : new Date();
  if (fecha_respuesta && isNaN(fechaResp.getTime())) {
    return res.status(400).json({
      success: false,
      error: 'Formato de fecha_respuesta inválido'
    });
  }

  try {
    const [result] = await pool.execute(
      `UPDATE Estudiante_Carga
       SET estado_seguimiento = ?,
           motivo_respuesta = ?,
           fecha_respuesta = ?
       WHERE estudiante_carga_id = ? AND carga_id = ?`,
      [estado_seguimiento, motivo_respuesta || null, fechaResp, estudianteCargaId, cargaId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Estudiante no encontrado en la carga especificada'
      });
    }

    await registrarAuditoria(cargaId, 'ESTUDIANTE_ACTUALIZADO', {
      estudianteCargaId,
      estado_seguimiento,
      motivo_respuesta,
      fecha_respuesta: fechaResp.toISOString()
    });

    return res.json({
      success: true,
      message: 'Estado del estudiante actualizado correctamente',
      estudianteCargaId,
      estado_seguimiento,
      motivo_respuesta,
      fecha_respuesta: fechaResp.toISOString()
    });
  } catch (error) {
    console.error('Error al actualizar estado de estudiante:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Error interno al actualizar estudiante',
      details: error.message
    });
  }
};