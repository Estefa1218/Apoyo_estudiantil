-- Script de Actualización: Derivación de Profesionales y Gestión de Recursos
-- Ejecutar este script en tu base de datos para agregar las nuevas funcionalidades

-- ============ ACTUALIZAR TABLA Estudiante_Carga ============
ALTER TABLE Estudiante_Carga
ADD COLUMN requiere_derivacion BOOLEAN DEFAULT FALSE,
ADD COLUMN email_profesional_derivado VARCHAR(255) NULL,
ADD COLUMN fecha_derivacion TIMESTAMP NULL,
ADD INDEX idx_derivacion (requiere_derivacion);

-- ============ CREAR TABLA RECURSOS_AUSENTISOS ============
CREATE TABLE IF NOT EXISTS Recursos_Ausentisos (
  recurso_id INT AUTO_INCREMENT PRIMARY KEY,
  estudiante_carga_id INT NOT NULL,
  tipo_recurso ENUM('PDF', 'DOCUMENTACION', 'PRESENTACION', 'URL') NOT NULL,
  descripcion VARCHAR(255) NOT NULL,
  archivo_url VARCHAR(500) NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (estudiante_carga_id) REFERENCES Estudiante_Carga(estudiante_carga_id) ON DELETE CASCADE,
  INDEX idx_estudiante (estudiante_carga_id),
  INDEX idx_tipo (tipo_recurso)
);

-- ============ VERIFICAR CAMBIOS ============
-- Verificar que se agregaron los campos
SELECT 'Verificando campos en Estudiante_Carga...' as status;
DESCRIBE Estudiante_Carga;

-- Verificar que se creó la tabla
SELECT 'Verificando tabla Recursos_Ausentisos...' as status;
DESCRIBE Recursos_Ausentisos;

-- ============ CONFIRMACIÓN ============
SELECT '✅ Actualización completada exitosamente' as resultado;
