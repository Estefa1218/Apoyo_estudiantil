-- Crear base de datos
CREATE DATABASE IF NOT EXISTS sistema_pae;
USE sistema_pae;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  correo VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de carga masiva
CREATE TABLE IF NOT EXISTS Carga_Masiva (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_archivo VARCHAR(255) NOT NULL,
  total_estudiantes INT NOT NULL,
  profesional_id INT NOT NULL,
  fecha_carga TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de estudiantes con carga
CREATE TABLE IF NOT EXISTS Estudiante_Carga (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_completo VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  dias_ausente INT NOT NULL,
  carga_id INT NOT NULL,
  fecha_primer_intento DATE,
  FOREIGN KEY (carga_id) REFERENCES Carga_Masiva(id)
);
