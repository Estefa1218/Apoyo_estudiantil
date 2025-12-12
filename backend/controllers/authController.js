import bcrypt from "bcrypt";
import pool from "../config/db.js";

export const register = async (req, res) => {
  const { nombre, email, password, rol } = req.body;

  try {
    // 1. Verificar si ya existe el email
    const [existing] = await pool.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // 2. Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insertar usuario
    await pool.query(
      `INSERT INTO usuarios (nombre, email, password, rol, fecha_registro)
       VALUES (?, ?, ?, ?, NOW())`,
      [nombre, email, hashedPassword, rol || "estudiante"]
    );

    res.status(201).json({ message: "Usuario registrado con éxito" });
  } catch (err) {
    console.error("Error en register:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};


export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Buscar usuario por email
    const [rows] = await pool.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    const user = rows[0];

    // 2. Validar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    // 3. Respuesta
    res.json({
      message: "Inicio de sesión exitoso",
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    });

  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};
