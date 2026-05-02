const pool = require('../config/db');
const { createAuthToken } = require('../utils/authToken');

const AUTH_PASSWORD = process.env.AUTH_PASSWORD || '';

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Correo y contraseña son obligatorios'
    });
  }

  if (!AUTH_PASSWORD) {
    return res.status(500).json({
      success: false,
      error: 'No se ha configurado AUTH_PASSWORD en el servidor'
    });
  }

  try {
    if (password !== AUTH_PASSWORD) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales incorrectas'
      });
    }

    const [users] = await pool.execute(
      'SELECT profesional_id, nombre_completo, email FROM Profesional WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales incorrectas'
      });
    }

    const user = users[0];
    const token = createAuthToken({
      id: user.profesional_id,
      email: user.email,
      nombre_completo: user.nombre_completo
    });

    return res.json({
      success: true,
      token,
      user: {
        id: user.profesional_id,
        email: user.email,
        nombre_completo: user.nombre_completo
      }
    });
  } catch (error) {
    console.error('Error en auth login:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Error interno al iniciar sesión',
      details: error.message
    });
  }
};

exports.me = (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autenticado'
    });
  }

  return res.json({
    success: true,
    user: req.user
  });
};