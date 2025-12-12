// backend/controllers/uploadController.js
import XLSX from "xlsx";
import pool from "../config/db.js";

export const handleUpload = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "No se subió ningún archivo .xlsx" });
    }

    // Leer XLSX
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Validar encabezados
    const headers = jsonData[0] || [];
    const expected = ["nombre", "correo", "dias_ausente"];
    const normalized = headers.map(h => (h || "").toString().toLowerCase().trim());

    if (!expected.every(h => normalized.includes(h))) {
      return res.status(400).json({
        error: "El archivo debe contener: nombre, correo, dias_ausente"
      });
    }

    // Identificar índices
    const iName = normalized.indexOf("nombre");
    const iCorreo = normalized.indexOf("correo");
    const iDias = normalized.indexOf("dias_ausente");

    const students = [];

    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row) continue;

      const name = row[iName]?.toString().trim();
      const correo = row[iCorreo]?.toString().trim();
      const dias = parseInt(row[iDias], 10);

      if (name && correo && !isNaN(dias)) {
        students.push({ name, correo, dias });
      }
    }

    if (students.length === 0) {
      return res.status(400).json({ error: "Archivo vacío o sin datos válidos" });
    }

    // Guardar en DB
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      const [carga] = await conn.query(
        "INSERT INTO Carga_Masiva (nombre_archivo, total_estudiantes, profesional_id) VALUES (?, ?, ?)",
        [req.file.originalname, students.length, 1]
      );

      const cargaId = carga.insertId;

      const inserts = students.map(s =>
        conn.query(
          `INSERT INTO Estudiante_Carga 
            (nombre_completo, email, dias_ausente, carga_id, fecha_primer_intento)
            VALUES (?, ?, ?, ?, CURDATE())`,
          [s.name, s.correo, s.dias, cargaId]
        )
      );

      await Promise.all(inserts);

      await conn.commit();

      return res.json({
        message: "Archivo cargado correctamente",
        cargaId,
        totalEstudiantes: students.length
      });

    } catch (err) {
      await conn.rollback();
      console.error(err);
      return res.status(500).json({ error: "Error al guardar en la base de datos" });
    } finally {
      conn.release();
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error procesando el archivo" });
  }
};
