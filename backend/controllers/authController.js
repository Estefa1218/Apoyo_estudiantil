import bcrypt from "bcrypt";
import pool from "../config/db.js";

export const register = async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    const [existing] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email]);

    if (existing.length > 0) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)",
      [nombre, email, hashed]
    );

    return res.status(201).json({ message: "Usuario registrado con éxito" });
  } catch (err) {
    console.error("Error en register:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email]);

    if (rows.length === 0) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    const user = rows[0];

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    res.json({ message: "Inicio de sesión exitoso" });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};

