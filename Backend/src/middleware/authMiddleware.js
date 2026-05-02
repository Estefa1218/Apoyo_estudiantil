const { verifyAuthToken } = require('../utils/authToken');

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Se requiere token de autorización'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAuthToken(token);
    req.user = {
      id: payload.id,
      email: payload.email,
      nombre_completo: payload.nombre_completo
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Token inválido o expirado',
      details: error.message
    });
  }
};
