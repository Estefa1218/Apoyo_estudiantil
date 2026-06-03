// src/controllers/derivacionController.js
const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

// ============ DERIVACIÓN DE PROFESIONAL ============

// Agregar o actualizar derivación de profesional
exports.addDerivacion = async (req, res) => {
  const { estudianteCargaId, cargaId, emailProfesional } = req.body;

  if (!estudianteCargaId || !cargaId || !emailProfesional) {
    return res.status(400).json({
      success: false,
      error: 'Faltan datos requeridos: estudianteCargaId, cargaId, emailProfesional'
    });
  }

  // Validar formato de email
  if (!emailProfesional.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return res.status(400).json({
      success: false,
      error: 'Formato de email inválido'
    });
  }

  try {
    // Verificar que el estudiante existe en la carga
    const [student] = await pool.execute(
      `SELECT estudiante_carga_id FROM Estudiante_Carga 
       WHERE estudiante_carga_id = ? AND carga_id = ?`,
      [estudianteCargaId, cargaId]
    );

    if (student.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Estudiante no encontrado en la carga especificada'
      });
    }

    // Actualizar la derivación
    const [result] = await pool.execute(
      `UPDATE Estudiante_Carga
       SET requiere_derivacion = TRUE,
           email_profesional_derivado = ?,
           fecha_derivacion = NOW()
       WHERE estudiante_carga_id = ? AND carga_id = ?`,
      [emailProfesional, estudianteCargaId, cargaId]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se pudo actualizar la derivación'
      });
    }

    return res.json({
      success: true,
      message: 'Derivación agregada exitosamente',
      data: {
        estudianteCargaId,
        emailProfesional,
        fecha_derivacion: new Date()
      }
    });
  } catch (error) {
    console.error('Error al agregar derivación:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno al agregar derivación',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Eliminar derivación de profesional
exports.deleteDerivacion = async (req, res) => {
  const { estudianteCargaId, cargaId } = req.params;

  if (!estudianteCargaId || !cargaId) {
    return res.status(400).json({
      success: false,
      error: 'Faltan datos requeridos: estudianteCargaId, cargaId'
    });
  }

  try {
    const [result] = await pool.execute(
      `UPDATE Estudiante_Carga
       SET requiere_derivacion = FALSE,
           email_profesional_derivado = NULL,
           fecha_derivacion = NULL
       WHERE estudiante_carga_id = ? AND carga_id = ?`,
      [estudianteCargaId, cargaId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'No se encontró la derivación para eliminar'
      });
    }

    return res.json({
      success: true,
      message: 'Derivación eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar derivación:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno al eliminar derivación',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener derivaciones de una carga
exports.getDerivacionesByCarga = async (req, res) => {
  const { cargaId } = req.params;

  if (!cargaId) {
    return res.status(400).json({
      success: false,
      error: 'cargaId es obligatorio'
    });
  }

  try {
    const [derivaciones] = await pool.execute(
      `SELECT estudiante_carga_id, nombre_completo, email, email_profesional_derivado, 
              fecha_derivacion, estado_seguimiento
       FROM Estudiante_Carga
       WHERE carga_id = ? AND requiere_derivacion = TRUE
       ORDER BY fecha_derivacion DESC`,
      [cargaId]
    );

    return res.json({
      success: true,
      cargaId,
      derivaciones
    });
  } catch (error) {
    console.error('Error al obtener derivaciones:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno al obtener derivaciones',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============ GESTIÓN DE RECURSOS ============

// Agregar recurso
exports.addRecurso = async (req, res) => {
  const { estudianteCargaId, tipoRecurso, descripcion, archivoUrl } = req.body;
  const file = req.file;

  if (!estudianteCargaId || !tipoRecurso || !descripcion) {
    return res.status(400).json({
      success: false,
      error: 'Faltan datos requeridos: estudianteCargaId, tipoRecurso, descripcion'
    });
  }

  // Validar tipos de recurso
  const tiposValidos = ['PDF', 'DOCUMENTACION', 'PRESENTACION', 'URL'];
  if (!tiposValidos.includes(tipoRecurso.toUpperCase())) {
    return res.status(400).json({
      success: false,
      error: `Tipo de recurso inválido. Valores permitidos: ${tiposValidos.join(', ')}`
    });
  }

  const tipoUpper = tipoRecurso.toUpperCase();

  try {
    // Validar que el estudiante existe
    const [student] = await pool.execute(
      `SELECT estudiante_carga_id FROM Estudiante_Carga WHERE estudiante_carga_id = ?`,
      [estudianteCargaId]
    );

    if (student.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Estudiante no encontrado'
      });
    }

    let archivoPath = null;

    // Validar según tipo de recurso
    if (tipoUpper === 'URL') {
      if (!archivoUrl || !archivoUrl.match(/^https?:\/\/.+/)) {
        return res.status(400).json({
          success: false,
          error: 'Para recursos URL, debe proporcionar una URL válida (http/https)'
        });
      }
      archivoPath = archivoUrl;
    } else if (['PDF', 'DOCUMENTACION', 'PRESENTACION'].includes(tipoUpper)) {
      if (!file) {
        return res.status(400).json({
          success: false,
          error: `Para recursos ${tipoUpper}, debe subir un archivo`
        });
      }
      archivoPath = file.path;
    }

    // Insertar recurso
    const [result] = await pool.execute(
      `INSERT INTO Recursos_Ausentisos (estudiante_carga_id, tipo_recurso, descripcion, archivo_url)
       VALUES (?, ?, ?, ?)`,
      [estudianteCargaId, tipoUpper, descripcion, archivoPath]
    );

    return res.json({
      success: true,
      message: 'Recurso agregado exitosamente',
      data: {
        recursoId: result.insertId,
        estudianteCargaId,
        tipoRecurso: tipoUpper,
        descripcion,
        archivo_url: archivoPath,
        fecha_creacion: new Date()
      }
    });
  } catch (error) {
    // Limpiar archivo si hubo error
    if (file && fs.existsSync(file.path)) {
      fs.unlink(file.path, (err) => {
        if (err) console.warn('⚠️ No se pudo eliminar archivo temporal:', err);
      });
    }

    console.error('Error al agregar recurso:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno al agregar recurso',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener recursos de un estudiante
exports.getRecursosByEstudiante = async (req, res) => {
  const { estudianteCargaId } = req.params;

  if (!estudianteCargaId) {
    return res.status(400).json({
      success: false,
      error: 'estudianteCargaId es obligatorio'
    });
  }

  try {
    const [recursos] = await pool.execute(
      `SELECT recurso_id, tipo_recurso, descripcion, archivo_url, fecha_creacion, fecha_actualizacion
       FROM Recursos_Ausentisos
       WHERE estudiante_carga_id = ?
       ORDER BY fecha_creacion DESC`,
      [estudianteCargaId]
    );

    return res.json({
      success: true,
      estudianteCargaId,
      recursos
    });
  } catch (error) {
    console.error('Error al obtener recursos:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno al obtener recursos',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Actualizar recurso
exports.updateRecurso = async (req, res) => {
  const { recursoId } = req.params;
  const { descripcion, archivoUrl } = req.body;
  const file = req.file;

  if (!recursoId) {
    return res.status(400).json({
      success: false,
      error: 'recursoId es obligatorio'
    });
  }

  try {
    // Obtener recurso actual
    const [recurso] = await pool.execute(
      `SELECT * FROM Recursos_Ausentisos WHERE recurso_id = ?`,
      [recursoId]
    );

    if (recurso.length === 0) {
      if (file && fs.existsSync(file.path)) {
        fs.unlink(file.path, (err) => {
          if (err) console.warn('⚠️ No se pudo eliminar archivo temporal:', err);
        });
      }
      return res.status(404).json({
        success: false,
        error: 'Recurso no encontrado'
      });
    }

    const recursoActual = recurso[0];
    let nuevoArchivo = recursoActual.archivo_url;

    // Actualizar archivo si se proporcionó
    if (file) {
      // Eliminar archivo anterior si existe
      if (recursoActual.archivo_url && !recursoActual.archivo_url.startsWith('http')) {
        if (fs.existsSync(recursoActual.archivo_url)) {
          fs.unlink(recursoActual.archivo_url, (err) => {
            if (err) console.warn('⚠️ No se pudo eliminar archivo anterior:', err);
          });
        }
      }
      nuevoArchivo = file.path;
    } else if (archivoUrl) {
      // Validar URL si se proporciona
      if (!archivoUrl.match(/^https?:\/\/.+/)) {
        return res.status(400).json({
          success: false,
          error: 'URL inválida (debe comenzar con http:// o https://)'
        });
      }
      nuevoArchivo = archivoUrl;
    }

    // Actualizar en BD
    const [result] = await pool.execute(
      `UPDATE Recursos_Ausentisos
       SET descripcion = ?, archivo_url = ?
       WHERE recurso_id = ?`,
      [descripcion || recursoActual.descripcion, nuevoArchivo, recursoId]
    );

    return res.json({
      success: true,
      message: 'Recurso actualizado exitosamente',
      data: {
        recursoId,
        descripcion: descripcion || recursoActual.descripcion,
        archivo_url: nuevoArchivo
      }
    });
  } catch (error) {
    if (file && fs.existsSync(file.path)) {
      fs.unlink(file.path, (err) => {
        if (err) console.warn('⚠️ No se pudo eliminar archivo temporal:', err);
      });
    }

    console.error('Error al actualizar recurso:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno al actualizar recurso',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Eliminar recurso
exports.deleteRecurso = async (req, res) => {
  const { recursoId } = req.params;

  if (!recursoId) {
    return res.status(400).json({
      success: false,
      error: 'recursoId es obligatorio'
    });
  }

  try {
    // Obtener recurso antes de eliminar
    const [recurso] = await pool.execute(
      `SELECT * FROM Recursos_Ausentisos WHERE recurso_id = ?`,
      [recursoId]
    );

    if (recurso.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Recurso no encontrado'
      });
    }

    // Eliminar archivo si existe
    const archivoUrl = recurso[0].archivo_url;
    if (archivoUrl && !archivoUrl.startsWith('http')) {
      if (fs.existsSync(archivoUrl)) {
        fs.unlink(archivoUrl, (err) => {
          if (err) console.warn('⚠️ No se pudo eliminar archivo:', err);
        });
      }
    }

    // Eliminar de BD
    const [result] = await pool.execute(
      `DELETE FROM Recursos_Ausentisos WHERE recurso_id = ?`,
      [recursoId]
    );

    return res.json({
      success: true,
      message: 'Recurso eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar recurso:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno al eliminar recurso',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Descargar recurso
exports.downloadRecurso = async (req, res) => {
  const { recursoId } = req.params;

  if (!recursoId) {
    return res.status(400).json({
      success: false,
      error: 'recursoId es obligatorio'
    });
  }

  try {
    // Obtener recurso
    const [recurso] = await pool.execute(
      `SELECT * FROM Recursos_Ausentisos WHERE recurso_id = ?`,
      [recursoId]
    );

    if (recurso.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Recurso no encontrado'
      });
    }

    const archivoUrl = recurso[0].archivo_url;

    // Si es una URL, redirigir
    if (archivoUrl.startsWith('http')) {
      return res.json({
        success: true,
        type: 'url',
        url: archivoUrl
      });
    }

    // Si es un archivo local, verificar que existe
    if (!fs.existsSync(archivoUrl)) {
      return res.status(404).json({
        success: false,
        error: 'Archivo no encontrado en el servidor'
      });
    }

    // Descargar archivo
    res.download(archivoUrl, (err) => {
      if (err) {
        console.error('Error al descargar archivo:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: 'Error al descargar el archivo'
          });
        }
      }
    });
  } catch (error) {
    console.error('Error al descargar recurso:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno al descargar recurso',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
