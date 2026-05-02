-- Base de datos: sistema_pae
-- Script para crear las tablas necesarias

-- Crear tabla Profesional
CREATE TABLE IF NOT EXISTS Profesional (
  profesional_id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_completo VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

-- Crear tabla Estudiante
CREATE TABLE IF NOT EXISTS Estudiante (
  estudiante_id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_completo VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefonico VARCHAR(20),
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_nombre (nombre_completo)
);

-- Crear tabla Carga_Masiva
CREATE TABLE IF NOT EXISTS Carga_Masiva (
  carga_id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_archivo VARCHAR(255) NOT NULL,
  total_estudiantes INT NOT NULL,
  profesional_id INT NOT NULL,
  correos_enviados INT DEFAULT 0,
  correos_fallidos INT DEFAULT 0,
  fecha_carga TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  estado ENUM('procesando', 'completado', 'fallido') DEFAULT 'procesando',
  FOREIGN KEY (profesional_id) REFERENCES Profesional(profesional_id),
  INDEX idx_profesional (profesional_id),
  INDEX idx_fecha (fecha_carga)
);

-- Crear tabla Estudiante_Carga
CREATE TABLE IF NOT EXISTS Estudiante_Carga (
  estudiante_carga_id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_completo VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  dias_ausente INT DEFAULT 0,
  carga_id INT NOT NULL,
  estudiante_id INT,
  estado_seguimiento ENUM('pendiente', 'enviado', 'respondido', 'no_responde') DEFAULT 'pendiente',
  fecha_primer_intento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  intentos_enviados INT DEFAULT 0,
  fecha_respuesta TIMESTAMP NULL,
  motivo_respuesta TEXT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (carga_id) REFERENCES Carga_Masiva(carga_id),
  FOREIGN KEY (estudiante_id) REFERENCES Estudiante(estudiante_id),
  INDEX idx_carga (carga_id),
  INDEX idx_email (email),
  INDEX idx_estado (estado_seguimiento),
  UNIQUE KEY unique_carga_email (carga_id, email)
);

-- Tabla de auditoría para seguimiento
CREATE TABLE IF NOT EXISTS Auditoria_Carga (
  auditoria_id INT AUTO_INCREMENT PRIMARY KEY,
  carga_id INT NOT NULL,
  evento VARCHAR(255) NOT NULL,
  detalles JSON,
  fecha_evento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (carga_id) REFERENCES Carga_Masiva(carga_id),
  INDEX idx_carga (carga_id),
  INDEX idx_fecha (fecha_evento)
);

-- Insertar un profesional de prueba si no existe
INSERT IGNORE INTO Profesional (profesional_id, nombre_completo, email)
VALUES (1, 'Profesional Predeterminado', 'profesional@sistema.local');
