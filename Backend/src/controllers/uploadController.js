// src/controllers/uploadController.js
const pool = require('../config/db');
const { parseExcelFile } = require('../utils/excelParser');
const { 
  mapColumns, 
  isValidEmail, 
  construirNombreCompleto,
  separarNombreApellido,
  extraerEmail, 
  extraerDiasAusencia 
} = require('../utils/columnMapper');
const nodemailer = require('nodemailer');
const emailScheduler = require('../services/emailSchedulerService');
const fs = require('fs');

// ============ FUNCIONES AUXILIARES ============

// Validar estructura completa de datos
function validarDatosCompletos(data) {
  const errores = [];
  
  if (!data.nombre_completo || data.nombre_completo.trim() === '') {
    errores.push('Nombre completo es requerido');
  }
  
  if (!data.email) {
    errores.push('Email es requerido');
  } else if (!isValidEmail(data.email)) {
    errores.push(`Email inválido: ${data.email}`);
  }
  
  // dias_ausente puede ser 0 si se calcula desde ultima_conexion
  if (data.dias_ausente === undefined || data.dias_ausente === null) {
    errores.push('No se pudo determinar días de ausencia');
  } else if (isNaN(data.dias_ausente) || data.dias_ausente < 0) {
    errores.push(`Días de ausencia inválido: ${data.dias_ausente}`);
  }
  
  return {
    valido: errores.length === 0,
    errores
  };
}

// Registrar evento en auditoría
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

// Enviar correos inmediatos
async function sendImmediateEmails(validData, cargaId) {
  try {
    console.log(`📧 Iniciando envío inmediato de correos para ${validData.length} estudiantes`);
    
    // Validar configuración de correo
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️ Configuración de correo incompleta. Saltando envío de emails.');
      return { sentCount: 0, errorCount: 0, skipped: true };
    }
    
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Verificar conexión
    try {
      await transporter.verify();
      console.log('✅ Conexión SMTP verificada');
    } catch (verifyError) {
      console.warn('⚠️ No se pudo verificar conexión SMTP:', verifyError.message);
      return { sentCount: 0, errorCount: 0, skipped: true };
    }

    const results = await Promise.all(validData.map(async (student) => {
      try {
        const mailOptions = {
          from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
          to: student.email,
          subject: '¡Te esperamos en tu proceso de acompañamiento estudiantil!',
          headers: {
            'X-Acompaniamiento-Email': student.email,
            'X-Acompaniamiento-Carga-Id': String(cargaId)
          },
          html: `
            <h1>¡Hola ${student.nombre_completo.split(' ')[0]}! 😊</h1>
            <p>Te invitamos a participar en el proceso de acompañamiento estudiantil.</p>
            <p>Hemos notado que has estado ausente en las últimas <strong>${student.dias_ausente}</strong> clases.</p>
            <p>Por favor, responde a este correo indicando tu situación actual.</p>
            <p>¡Estamos aquí para apoyarte!</p>
            <hr>
            <p><strong>Saludos,</strong><br>Equipo de Acompañamiento Estudiantil</p>
          `,
          text: `Hola ${student.nombre_completo.split(' ')[0]},\n\nTe invitamos a participar en el proceso de acompañamiento estudiantil. Hemos notado que has estado ausente en las últimas ${student.dias_ausente} clases.\n\nPor favor, responde a este correo indicando tu situación actual.\n\n¡Estamos aquí para apoyarte!\n\nSaludos,\nEquipo de Acompañamiento Estudiantil`
        };

        await transporter.sendMail(mailOptions);
        
        // Actualizar estado del estudiante
        await pool.execute(
          `UPDATE Estudiante_Carga 
           SET estado_seguimiento = 'enviado', 
               intentos_enviados = 1
           WHERE email = ? AND carga_id = ?`,
          [student.email, cargaId]
        );
        
        console.log(`✅ Correo enviado a: ${student.email}`);
        return { email: student.email, status: 'sent' };
      } catch (error) {
        console.error(`❌ Error al enviar correo a ${student.email}:`, error.message);
        return { email: student.email, status: 'error', error: error.message };
      }
    }));

    const sentCount = results.filter(r => r.status === 'sent').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    
    console.log(`📊 Resultados: ${sentCount} enviados, ${errorCount} fallidos`);
    
    return { sentCount, errorCount, skipped: false };
  } catch (error) {
    console.error('🔥 Error al inicializar envío de correos:', error.message);
    return { sentCount: 0, errorCount: 0, skipped: true, error: error.message };
  }
}

// Controlador principal
exports.uploadStudentsFile = async (req, res) => {
  console.log('📥 Recibiendo solicitud de carga de archivo...');
  
  const connection = await pool.getConnection();
  
  try {
    // ============ VALIDAR ARCHIVO ============
    if (!req.file) {
      console.error('❌ Error: No se recibió ningún archivo');
      return res.status(400).json({ 
        error: 'No se ha subido ningún archivo.',
        code: 'NO_FILE'
      });
    }

    console.log(`📄 Archivo recibido: ${req.file.originalname} (${req.file.size} bytes)`);
    
    // ============ PARSEAR EXCEL ============
    let rawData;
    try {
      rawData = parseExcelFile(req.file.path);
    } catch (error) {
      console.error('❌ Error al parsear Excel:', error.message);
      return res.status(400).json({ 
        error: 'Error al leer el archivo Excel',
        details: error.message,
        code: 'PARSE_ERROR'
      });
    }
    
    if (!rawData || rawData.length === 0) {
      console.error('❌ Error: El archivo Excel está vacío');
      return res.status(400).json({ 
        error: 'El archivo Excel está vacío o no tiene datos válidos.',
        code: 'EMPTY_FILE'
      });
    }

    console.log(`📊 Datos leídos: ${rawData.length} filas`);

    // ============ MAPEAR COLUMNAS ============
    const headers = Object.keys(rawData[0]);
    console.log(`🏷️ Encabezados detectados: ${headers.join(', ')}`);
    
    const { mapping, missing, available } = mapColumns(headers);
    
    if (missing.length > 0) {
      console.error(`❌ Faltan columnas requeridas: ${missing.join(', ')}`);
      
      // Mensaje personalizado según lo que falta
      let mensaje = `El archivo necesita las siguientes columnas: ${missing.join(', ')}.`;
      if (missing.includes('ultima_conexion')) {
        mensaje += ' (La columna "Última conexión" es necesaria para calcular automáticamente los días de ausencia)';
      }
      
      return res.status(400).json({ 
        error: mensaje,
        missingColumns: missing,
        availableColumns: available,
        code: 'MISSING_COLUMNS',
        hint: 'Tu archivo debe tener: Nombre, Apellido (o Nombre Completo), Email, y Última Conexión. Los días de ausencia se calculan automáticamente.'
      });
    }

    console.log(`✅ Columnas mapeadas:`, mapping);
    console.log(`💡 Nota: días de ausencia se calculará automáticamente desde la fecha de última conexión`);

    // ============ EXTRAER Y VALIDAR DATOS ============
    const datosExtraidos = rawData.map((row, index) => {
      const nombre_completo = construirNombreCompleto(row, mapping);
      const email = extraerEmail(row, mapping);
      const dias_ausente = extraerDiasAusencia(row, mapping);
      
      const validacion = validarDatosCompletos({
        nombre_completo,
        email,
        dias_ausente
      });
      
      return {
        nombre_completo,
        email,
        dias_ausente,
        fila: index + 2,
        valido: validacion.valido,
        errores: validacion.errores
      };
    });

    // ============ SEPARAR DATOS VÁLIDOS E INVÁLIDOS ============
    const validData = datosExtraidos.filter(row => row.valido);
    const invalidData = datosExtraidos.filter(row => !row.valido);

    console.log(`✅ Datos válidos: ${validData.length}`);
    if (invalidData.length > 0) {
      console.warn(`⚠️ Filas inválidas: ${invalidData.length}`);
      invalidData.forEach(row => {
        console.warn(`  Fila ${row.fila}: ${row.errores.join(', ')}`);
      });
    }

    if (validData.length === 0) {
      console.error('❌ Error: No hay datos válidos en el archivo');
      return res.status(400).json({ 
        error: 'No se encontraron datos válidos en el archivo.',
        invalidRows: invalidData.map(r => ({
          fila: r.fila,
          errores: r.errores
        })),
        code: 'NO_VALID_DATA'
      });
    }

    // ============ INICIAR TRANSACCIÓN ============
    console.log(`🔄 Iniciando transacción para ${validData.length} estudiantes...`);
    await connection.beginTransaction();
    console.log('✅ Transacción iniciada');

    try {
      // ============ INSERTAR CARGA_MASIVA ============
      const profesionalId = process.env.DEFAULT_PROFESSIONAL_ID || req.user?.id || 1;
      const [cargaResult] = await connection.execute(
        `INSERT INTO Carga_Masiva (nombre_archivo, total_estudiantes, profesional_id, estado)
         VALUES (?, ?, ?, 'procesando')`,
        [req.file.originalname, validData.length, profesionalId]
      );

      const cargaId = cargaResult.insertId;
      console.log(`✅ [Carga #${cargaId}] Registrada en BD`);

      // ============ INSERTAR ESTUDIANTES_CARGA ============
      const studentValues = validData.map(row => [
        row.nombre_completo,
        row.email,
        row.dias_ausente,
        cargaId,
        null,
        'pendiente',
        new Date(),
        0,
        null,
        null
      ]);

      // Usar INSERT IGNORE para evitar duplicados
      const [insertResult] = await connection.query(
        `INSERT IGNORE INTO Estudiante_Carga (
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

      console.log(`✅ [Carga #${cargaId}] ${insertResult.affectedRows} estudiantes insertados`);

      // ============ REGISTRAR EN AUDITORÍA ANTES DE COMMIT ============
      await registrarAuditoria(cargaId, 'CARGA_INICIADA', {
        total_archivo: datosExtraidos.length,
        validos: validData.length,
        invalidos: invalidData.length,
        archivo: req.file.originalname,
        timestamp: new Date().toISOString()
      });
      console.log(`✅ [Carga #${cargaId}] Auditoría registrada`);

      // ============ CONFIRMAR TRANSACCIÓN ============
      await connection.commit();
      console.log(`✅ [Carga #${cargaId}] Transacción CONFIRMADA ✓`);

      // ============ ENVIAR CORREOS (después de confirmar) ============
      let emailResults = { sentCount: 0, errorCount: 0 };
      try {
        console.log(`📧 [Carga #${cargaId}] Iniciando envío de correos...`);
        emailResults = await sendImmediateEmails(validData, cargaId);
        
        // Actualizar carga con información de envío
        await pool.execute(
          `UPDATE Carga_Masiva 
           SET correos_enviados = ?, correos_fallidos = ?, estado = 'completado'
           WHERE carga_id = ?`,
          [emailResults.sentCount, emailResults.errorCount, cargaId]
        );

        console.log(`✅ [Carga #${cargaId}] Estado actualizado: completado`);

        await registrarAuditoria(cargaId, 'CORREOS_ENVIADOS', {
          ...emailResults,
          timestamp: new Date().toISOString()
        });

        // Iniciar scheduler para envíos diarios durante 8 días
        emailScheduler.startSchedulerForCarga(cargaId);
        console.log(`⏰ [Carga #${cargaId}] Scheduler diario iniciado`);
      } catch (emailError) {
        console.error(`⚠️ [Carga #${cargaId}] Error al enviar correos:`, emailError.message);
        
        // Registrar error pero no fallar la respuesta
        await registrarAuditoria(cargaId, 'ERROR_CORREOS', {
          error: emailError.message,
          timestamp: new Date().toISOString()
        });
        
        // Actualizar estado como completado de todas formas
        await pool.execute(
          `UPDATE Carga_Masiva SET estado = 'completado' WHERE carga_id = ?`,
          [cargaId]
        );
      }

      // ============ RESPUESTA EXITOSA ============
      return res.status(201).json({
        success: true,
        message: 'Archivo procesado exitosamente',
        cargaId,
        estadisticas: {
          totalArchivo: datosExtraidos.length,
          procesados: validData.length,
          ignorados: invalidData.length,
          correos: {
            enviados: emailResults.sentCount,
            fallidos: emailResults.errorCount
          }
        },
        detalles: {
          archivo: req.file.originalname,
          columnasDetectadas: mapping,
          filasInvalidas: invalidData.length > 0 ? invalidData.map(r => ({
            fila: r.fila,
            errores: r.errores
          })) : undefined
        },
        timestamp: new Date().toISOString()
      });

    } catch (transactionError) {
      // ============ ROLLBACK EN CASO DE ERROR ============
      try {
        console.error(`🔥 [TRANSACCIÓN] Error detectado, iniciando ROLLBACK:`, transactionError.message);
        await connection.rollback();
        console.log(`✅ [TRANSACCIÓN] ROLLBACK completado - No se guardó nada`);
      } catch (rollbackError) {
        console.error(`🔥 Error al hacer ROLLBACK:`, rollbackError.message);
      }
      
      return res.status(500).json({
        success: false,
        error: 'Error al guardar los datos en la base de datos',
        code: 'TRANSACTION_ERROR',
        details: process.env.NODE_ENV === 'development' ? transactionError.message : undefined,
        hint: 'Verifica que la conexión a BD está activa y que has ejecutado: mysql < sistema_pae.sql'
      });
    }

  } catch (error) {
    console.error('🔥 Error crítico en uploadStudentsFile:', error);
    
    // Limpiar archivo temporal
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('🗑️ Archivo temporal eliminado');
      } catch (e) {
        console.warn('⚠️ No se pudo eliminar el archivo temporal:', e.message);
      }
    }

    return res.status(500).json({
      success: false,
      error: 'Error interno al procesar el archivo',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      code: 'INTERNAL_ERROR'
    });

  } finally {
    // Liberar conexión
    if (connection) {
      connection.release();
    }
  }
};

// Controlador para ver estado de carga
exports.getLoadStatus = async (req, res) => {
  const { cargaId } = req.params;
  
  try {
    const [carga] = await pool.execute(
      `SELECT * FROM Carga_Masiva WHERE carga_id = ?`,
      [cargaId]
    );

    if (carga.length === 0) {
      return res.status(404).json({
        error: 'Carga no encontrada',
        code: 'NOT_FOUND'
      });
    }

    const [estudiantes] = await pool.execute(
      `SELECT * FROM Estudiante_Carga WHERE carga_id = ?`,
      [cargaId]
    );

    const [auditoria] = await pool.execute(
      `SELECT * FROM Auditoria_Carga WHERE carga_id = ? ORDER BY fecha_evento DESC`,
      [cargaId]
    );

    return res.json({
      carga: carga[0],
      estadisticas: {
        total: estudiantes.length,
        pendiente: estudiantes.filter(e => e.estado_seguimiento === 'pendiente').length,
        enviado: estudiantes.filter(e => e.estado_seguimiento === 'enviado').length,
        respondido: estudiantes.filter(e => e.estado_seguimiento === 'respondido').length,
        no_responde: estudiantes.filter(e => e.estado_seguimiento === 'no_responde').length
      },
      auditoria: auditoria
    });

  } catch (error) {
    console.error('Error al obtener estado de carga:', error);
    return res.status(500).json({
      error: 'Error al obtener estado',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// Registrar respuesta de estudiante (ej. cuando contesta el correo)
exports.setStudentResponse = async (req, res) => {
  const { cargaId, email, motivo_respuesta, fecha_respuesta, estado_seguimiento } = req.body;

  if (!cargaId || !email || !motivo_respuesta) {
    return res.status(400).json({
      error: 'Faltan datos requeridos: cargaId, email, motivo_respuesta',
      code: 'MISSING_FIELDS'
    });
  }

  try {
    const fechaResp = fecha_respuesta ? new Date(fecha_respuesta) : new Date();
    if (fecha_respuesta && isNaN(fechaResp.getTime())) {
      return res.status(400).json({
        error: 'Formato de fecha_respuesta inválido',
        code: 'INVALID_DATE'
      });
    }

    const estado = estado_seguimiento || 'respondido';

    const [result] = await pool.execute(
      `UPDATE Estudiante_Carga
       SET estado_seguimiento = ?,
           fecha_respuesta = ?,
           motivo_respuesta = ?
       WHERE carga_id = ? AND email = ?`,
      [estado, fechaResp, motivo_respuesta, cargaId, email]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'No se encontró el estudiante en esa carga',
        code: 'NOT_FOUND'
      });
    }

    await registrarAuditoria(cargaId, 'ESTUDIANTE_RESPONDIO', {
      email,
      estado,
      motivo_respuesta,
      fecha_respuesta: fechaResp.toISOString()
    });

    return res.json({
      success: true,
      message: 'Respuesta registrada correctamente',
      cargaId,
      email,
      estado,
      fecha_respuesta: fechaResp.toISOString(),
      motivo_respuesta
    });
  } catch (error) {
    console.error('Error al registrar respuesta de estudiante:', error);
    return res.status(500).json({
      error: 'Error interno al actualizar respuesta del estudiante',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};