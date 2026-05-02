// src/controllers/responseListenerController.js
const emailResponseService = require('../services/emailResponseService');

module.exports.startListener = (req, res) => {
  try {
    if (emailResponseService.isRunning) {
      return res.status(400).json({
        error: 'El servicio de escucha de respuestas ya está activo'
      });
    }

    emailResponseService.startListening();
    
    return res.status(200).json({
      success: true,
      message: '✅ Servicio de captura de respuestas iniciado',
      details: 'El sistema ahora escucha automáticamente las respuestas de correo',
      status: emailResponseService.getStatus()
    });
  } catch (error) {
    console.error('Error iniciando listener:', error);
    return res.status(500).json({
      error: 'Error al iniciar el servicio de respuestas',
      details: error.message
    });
  }
};

module.exports.stopListener = (req, res) => {
  try {
    if (!emailResponseService.isRunning) {
      return res.status(400).json({
        error: 'El servicio de escucha no está activo'
      });
    }

    emailResponseService.stop();
    
    return res.status(200).json({
      success: true,
      message: '🛑 Servicio de captura de respuestas detenido',
      status: emailResponseService.getStatus()
    });
  } catch (error) {
    console.error('Error deteniendo listener:', error);
    return res.status(500).json({
      error: 'Error al detener el servicio',
      details: error.message
    });
  }
};

module.exports.getListenerStatus = (req, res) => {
  try {
    const status = emailResponseService.getStatus();
    return res.status(200).json({
      success: true,
      status: status
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Error obteniendo estado',
      details: error.message
    });
  }
};
