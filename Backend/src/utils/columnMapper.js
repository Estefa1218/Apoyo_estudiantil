// src/utils/columnMapper.js
const COLUMN_MAPPINGS = {
  nombre: [
    'nombre', 'nombres', 'first name', 'primer nombre', 'nombre de pila'
  ],
  apellido: [
    'apellido', 'apellidos', 'last name', 'surname', 'apellido paterno'
  ],
  nombre_completo: [
    'nombre completo', 'full name', 'nombre y apellido', 'alumno', 'estudiante'
  ],
  email: [
    'email', 'correo', 'correo electronico', 'correo electrónico', 
    'email institucional', 'correo institucional', 'e-mail', 'mail', 'dirección de correo'
  ],
  ultima_conexion: [
    'última conexión', 'ultima conexion', 'última asistencia', 'ultima asistencia',
    'fecha última conexión', 'fecha ultima conexion', 'last login', 'last access',
    'fecha de última conexión', 'último acceso', 'ultimo acceso'
  ],
  dias_ausente: [
    'dias ausente', 'días ausente', 'dias sin asistencia', 'días sin asistencia',
    'ausencias', 'dias', 'días', 'days absent', 'absent days'
  ]
};

// Normaliza un encabezado para comparación
function normalizeHeader(header) {
  return header
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina tildes
    .replace(/\s+/g, ' ')            // Reduce espacios múltiples
    .replace(/[^a-z0-9\s]/g, '');    // Elimina caracteres especiales
}

// Busca coincidencia flexible de encabezados
function mapColumns(headers) {
  const mapping = {};
  const found = new Set();
  
  // Campos REQUERIDOS (siempre necesarios)
  const requiredFields = ['nombre', 'apellido', 'nombre_completo', 'email', 'ultima_conexion'];
  
  // Buscar cada campo
  for (const [field, possibleNames] of Object.entries(COLUMN_MAPPINGS)) {
    for (const header of headers) {
      const normalizedHeader = normalizeHeader(header);
      
      // Verificar si coincide con algún nombre posible
      if (possibleNames.some(name => 
        normalizedHeader.includes(normalizeHeader(name)) || 
        normalizeHeader(name).includes(normalizedHeader)
      )) {
        mapping[field] = header;
        found.add(field);
        break;
      }
    }
  }
  
  // Campos faltantes: SOLO los requeridos
  const missing = requiredFields.filter(field => !found.has(field));
  
  // Si no está dias_ausente pero sí está ultima_conexion, está bien (se calcula automáticamente)
  
  return {
    mapping,
    missing, // Solo campos requeridos
    available: headers
  };
}

// Valida que sea un email válido (contiene @)
function isValidEmail(email) {
  const str = String(email || '').trim();
  return str.includes('@') && str.length > 5;
}

// Intenta parsear una fecha en varios formatos comunes (incluye español)
function parseFechaFlexible(fechaString) {
  if (!fechaString) return null;
  const raw = String(fechaString).trim().toLowerCase();

  // 1) Formato numérico estándar: DD/MM/AAAA o DD-MM-AAAA
  const numericMatch = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (numericMatch) {
    const dia = parseInt(numericMatch[1], 10);
    const mes = parseInt(numericMatch[2], 10) - 1;
    let anio = parseInt(numericMatch[3], 10);
    if (anio < 100) anio += anio < 70 ? 2000 : 1900;
    return new Date(anio, mes, dia);
  }

  // 2) Formato español con nombre de mes: "22 de febrero" o "22 de febrero de 2026"
  const meses = {
    enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
    julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
  };
  const spanishMatch = raw.match(/^(\d{1,2})\s+de\s+([a-záéíóúñ]+)(?:\s+de\s+(\d{4}))?$/u);
  if (spanishMatch) {
    const dia = parseInt(spanishMatch[1], 10);
    const mesNombre = spanishMatch[2];
    const mes = meses[mesNombre];
    const anio = spanishMatch[3] ? parseInt(spanishMatch[3], 10) : new Date().getFullYear();

    if (mes !== undefined && dia >= 1 && dia <= 31) {
      return new Date(anio, mes, dia);
    }
  }

  // 3) También soportar YYYY-MM-DD / YYYY/MM/DD
  const isoMatch = raw.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (isoMatch) {
    const anio = parseInt(isoMatch[1], 10);
    const mes = parseInt(isoMatch[2], 10) - 1;
    const dia = parseInt(isoMatch[3], 10);
    return new Date(anio, mes, dia);
  }

  // 4) Fallback al constructor Date estándar
  const fallback = new Date(fechaString);
  return isNaN(fallback.getTime()) ? null : fallback;
}

// Calcula días desde última conexión hasta hoy
function calcularDiasAusencia(fechaUltimaConexion) {
  if (!fechaUltimaConexion) return 0;

  try {
    const fecha = parseFechaFlexible(fechaUltimaConexion);

    // Si no es una fecha válida, retornar 0
    if (!fecha || isNaN(fecha.getTime())) return 0;

    const hoy = new Date();
    const diferenciMs = hoy.getTime() - fecha.getTime();
    const dias = Math.floor(diferenciMs / (1000 * 60 * 60 * 24));

    return Math.max(0, dias); // No retornar negativos
  } catch (error) {
    console.error('Error al calcular días de ausencia:', error);
    return 0;
  }
}

// Separa nombre y apellido si vienen combinados en una cadena
// Ejemplo: "Juan García" → { nombre: "Juan", apellido: "García" }
function separarNombreApellido(nombreCompleto) {
  if (!nombreCompleto) return { nombre: '', apellido: '' };
  
  const partes = String(nombreCompleto || '')
    .trim()
    .split(/\s+/)
    .filter(p => p.length > 0);
  
  if (partes.length === 0) {
    return { nombre: '', apellido: '' };
  }
  
  if (partes.length === 1) {
    // Si solo hay una palabra, asumir que es el nombre
    return { nombre: partes[0], apellido: '' };
  }
  
  // Si hay 2+ palabras, primera es nombre, resto es apellido
  return {
    nombre: partes[0],
    apellido: partes.slice(1).join(' ')
  };
}

// Combina nombre y apellido si vienen por separado
function construirNombreCompleto(row, mapping) {
  // Si existe nombre_completo en la fila, usarlo
  if (mapping.nombre_completo && row[mapping.nombre_completo]) {
    return String(row[mapping.nombre_completo] || '').trim();
  }
  
  // Si existen nombre y apellido por separado, combinarlos
  let nombre = '';
  if (mapping.nombre && row[mapping.nombre]) {
    nombre = String(row[mapping.nombre] || '').trim();
  }
  
  let apellido = '';
  if (mapping.apellido && row[mapping.apellido]) {
    apellido = String(row[mapping.apellido] || '').trim();
  }
  
  // Si ambos existen, combinarlos
  if (nombre && apellido) {
    return `${nombre} ${apellido}`;
  }
  
  // Si solo uno existe, retornar ese
  return (nombre || apellido).trim() || '';
}

// Extrae email validando el carácter @
function extraerEmail(row, mapping) {
  if (!mapping.email) return '';
  
  const email = String(row[mapping.email] || '').trim().toLowerCase();
  return isValidEmail(email) ? email : '';
}

// Extrae días de ausencia (puede venir como número directo o calcular desde última conexión)
function extraerDiasAusencia(row, mapping) {
  // Opción 1: Si hay días directamente en el Excel
  if (mapping.dias_ausente && row[mapping.dias_ausente]) {
    const dias = parseInt(row[mapping.dias_ausente], 10);
    if (!isNaN(dias) && dias >= 0) return dias;
  }
  
  // Opción 2: Si hay fecha de última conexión, calcular
  if (mapping.ultima_conexion && row[mapping.ultima_conexion]) {
    return calcularDiasAusencia(row[mapping.ultima_conexion]);
  }
  
  return 0;
}

module.exports = { 
  mapColumns,
  isValidEmail,
  calcularDiasAusencia,
  construirNombreCompleto,
  separarNombreApellido,
  extraerEmail,
  extraerDiasAusencia
};