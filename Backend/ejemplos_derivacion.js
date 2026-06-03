/**
 * EJEMPLOS DE USO: Derivación de Profesionales y Gestión de Recursos
 * Archivo: derivacionExamples.js
 * 
 * Estos ejemplos muestran cómo integrar los nuevos endpoints en el frontend
 */

const API_BASE = 'http://localhost:3001/api/derivacion';
const TOKEN = localStorage.getItem('token'); // Obtener token de localStorage

// ============ FUNCIONES DE DERIVACIÓN ============

/**
 * Agregar derivación de profesional
 * @param {number} estudianteCargaId - ID del estudiante en la carga
 * @param {number} cargaId - ID de la carga
 * @param {string} emailProfesional - Email del profesional
 */
async function agregarDerivacion(estudianteCargaId, cargaId, emailProfesional) {
  try {
    const response = await fetch(`${API_BASE}/derivacion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({
        estudianteCargaId,
        cargaId,
        emailProfesional
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Derivación agregada:', data.data);
      return data.data;
    } else {
      console.error('❌ Error:', data.error);
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Error al agregar derivación:', error);
    throw error;
  }
}

/**
 * Eliminar derivación
 * @param {number} estudianteCargaId - ID del estudiante
 * @param {number} cargaId - ID de la carga
 */
async function eliminarDerivacion(estudianteCargaId, cargaId) {
  try {
    const response = await fetch(
      `${API_BASE}/derivacion/${estudianteCargaId}/${cargaId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${TOKEN}`
        }
      }
    );

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Derivación eliminada');
      return true;
    } else {
      console.error('❌ Error:', data.error);
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Error al eliminar derivación:', error);
    throw error;
  }
}

/**
 * Obtener todas las derivaciones de una carga
 * @param {number} cargaId - ID de la carga
 */
async function obtenerDerivaciones(cargaId) {
  try {
    const response = await fetch(
      `${API_BASE}/derivaciones/${cargaId}`,
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`
        }
      }
    );

    const data = await response.json();
    
    if (data.success) {
      console.log('Derivaciones encontradas:', data.derivaciones);
      return data.derivaciones;
    } else {
      console.error('❌ Error:', data.error);
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Error al obtener derivaciones:', error);
    throw error;
  }
}

// ============ FUNCIONES DE RECURSOS ============

/**
 * Agregar recurso (archivo)
 * @param {number} estudianteCargaId - ID del estudiante
 * @param {string} tipoRecurso - Tipo: PDF, DOCUMENTACION, PRESENTACION
 * @param {string} descripcion - Descripción del recurso
 * @param {File} archivo - Archivo a subir
 */
async function agregarRecursoArchivo(estudianteCargaId, tipoRecurso, descripcion, archivo) {
  try {
    const formData = new FormData();
    formData.append('estudianteCargaId', estudianteCargaId);
    formData.append('tipoRecurso', tipoRecurso);
    formData.append('descripcion', descripcion);
    formData.append('archivo', archivo);

    const response = await fetch(`${API_BASE}/recurso`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      },
      body: formData
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Recurso agregado:', data.data);
      return data.data;
    } else {
      console.error('❌ Error:', data.error);
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Error al agregar recurso:', error);
    throw error;
  }
}

/**
 * Agregar recurso (URL)
 * @param {number} estudianteCargaId - ID del estudiante
 * @param {string} tipoRecurso - Tipo: URL, DOCUMENTACION, PRESENTACION
 * @param {string} descripcion - Descripción del recurso
 * @param {string} archivoUrl - URL del recurso
 */
async function agregarRecursoURL(estudianteCargaId, tipoRecurso, descripcion, archivoUrl) {
  try {
    const response = await fetch(`${API_BASE}/recurso`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({
        estudianteCargaId,
        tipoRecurso,
        descripcion,
        archivoUrl
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Recurso agregado:', data.data);
      return data.data;
    } else {
      console.error('❌ Error:', data.error);
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Error al agregar recurso:', error);
    throw error;
  }
}

/**
 * Obtener recursos de un estudiante
 * @param {number} estudianteCargaId - ID del estudiante
 */
async function obtenerRecursos(estudianteCargaId) {
  try {
    const response = await fetch(
      `${API_BASE}/recursos/${estudianteCargaId}`,
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`
        }
      }
    );

    const data = await response.json();
    
    if (data.success) {
      console.log('Recursos encontrados:', data.recursos);
      return data.recursos;
    } else {
      console.error('❌ Error:', data.error);
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Error al obtener recursos:', error);
    throw error;
  }
}

/**
 * Actualizar recurso (solo descripción)
 * @param {number} recursoId - ID del recurso
 * @param {string} descripcion - Nueva descripción
 */
async function actualizarRecursoDescripcion(recursoId, descripcion) {
  try {
    const response = await fetch(`${API_BASE}/recurso/${recursoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({ descripcion })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Recurso actualizado:', data.data);
      return data.data;
    } else {
      console.error('❌ Error:', data.error);
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Error al actualizar recurso:', error);
    throw error;
  }
}

/**
 * Actualizar recurso (archivo)
 * @param {number} recursoId - ID del recurso
 * @param {string} descripcion - Nueva descripción
 * @param {File} archivo - Nuevo archivo
 */
async function actualizarRecursoArchivo(recursoId, descripcion, archivo) {
  try {
    const formData = new FormData();
    formData.append('descripcion', descripcion);
    formData.append('archivo', archivo);

    const response = await fetch(`${API_BASE}/recurso/${recursoId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      },
      body: formData
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Recurso actualizado:', data.data);
      return data.data;
    } else {
      console.error('❌ Error:', data.error);
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Error al actualizar recurso:', error);
    throw error;
  }
}

/**
 * Actualizar recurso (URL)
 * @param {number} recursoId - ID del recurso
 * @param {string} descripcion - Nueva descripción
 * @param {string} archivoUrl - Nueva URL
 */
async function actualizarRecursoURL(recursoId, descripcion, archivoUrl) {
  try {
    const response = await fetch(`${API_BASE}/recurso/${recursoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({ descripcion, archivoUrl })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Recurso actualizado:', data.data);
      return data.data;
    } else {
      console.error('❌ Error:', data.error);
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Error al actualizar recurso:', error);
    throw error;
  }
}

/**
 * Eliminar recurso
 * @param {number} recursoId - ID del recurso
 */
async function eliminarRecurso(recursoId) {
  try {
    const response = await fetch(`${API_BASE}/recurso/${recursoId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Recurso eliminado');
      return true;
    } else {
      console.error('❌ Error:', data.error);
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Error al eliminar recurso:', error);
    throw error;
  }
}

/**
 * Descargar o acceder a recurso
 * @param {number} recursoId - ID del recurso
 */
async function descargarRecurso(recursoId) {
  try {
    const response = await fetch(`${API_BASE}/recurso/descargar/${recursoId}`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });

    const data = await response.json();
    
    if (data.success) {
      if (data.type === 'url') {
        // Es una URL, abrir en nueva ventana
        window.open(data.url, '_blank');
        console.log('🌐 Abriendo URL:', data.url);
      } else {
        // Es un archivo, descargar
        console.log('📥 Descargando archivo...');
      }
      return data;
    } else {
      console.error('❌ Error:', data.error);
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Error al descargar recurso:', error);
    throw error;
  }
}

// ============ EJEMPLOS DE USO EN HTML ============

/**
 * EJEMPLO 1: Agregar derivación desde un formulario
 */
function ejemploAgregarDerivacion() {
  // HTML esperado:
  // <input id="emailProfesional" type="email" placeholder="Email del profesional">
  // <button onclick="btnAgregarDerivacion()">Agregar Derivación</button>
  
  async function btnAgregarDerivacion() {
    const email = document.getElementById('emailProfesional').value;
    const estudianteCargaId = 1; // Obtenido del contexto
    const cargaId = 5; // Obtenido del contexto
    
    try {
      await agregarDerivacion(estudianteCargaId, cargaId, email);
      alert('✅ Derivación agregada exitosamente');
      document.getElementById('emailProfesional').value = '';
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  }
}

/**
 * EJEMPLO 2: Subir archivo PDF
 */
function ejemploSubirPDF() {
  // HTML esperado:
  // <input id="filePDF" type="file" accept=".pdf">
  // <input id="descriptionPDF" placeholder="Descripción">
  // <button onclick="btnSubirPDF()">Subir PDF</button>
  
  async function btnSubirPDF() {
    const fileInput = document.getElementById('filePDF');
    const descripcion = document.getElementById('descriptionPDF').value;
    const archivo = fileInput.files[0];
    const estudianteCargaId = 1; // Obtenido del contexto
    
    if (!archivo) {
      alert('Por favor selecciona un archivo');
      return;
    }
    
    try {
      await agregarRecursoArchivo(estudianteCargaId, 'PDF', descripcion, archivo);
      alert('✅ PDF subido exitosamente');
      fileInput.value = '';
      document.getElementById('descriptionPDF').value = '';
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  }
}

/**
 * EJEMPLO 3: Agregar URL compartida
 */
function ejemploAgregarURL() {
  // HTML esperado:
  // <input id="urlRecurso" type="url" placeholder="URL del recurso">
  // <input id="descriptionURL" placeholder="Descripción">
  // <button onclick="btnAgregarURL()">Agregar URL</button>
  
  async function btnAgregarURL() {
    const url = document.getElementById('urlRecurso').value;
    const descripcion = document.getElementById('descriptionURL').value;
    const estudianteCargaId = 1; // Obtenido del contexto
    
    if (!url) {
      alert('Por favor ingresa una URL');
      return;
    }
    
    try {
      await agregarRecursoURL(estudianteCargaId, 'PRESENTACION', descripcion, url);
      alert('✅ URL agregada exitosamente');
      document.getElementById('urlRecurso').value = '';
      document.getElementById('descriptionURL').value = '';
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  }
}

/**
 * EJEMPLO 4: Listar recursos de un estudiante
 */
async function ejemploListarRecursos() {
  const estudianteCargaId = 1; // Obtenido del contexto
  
  try {
    const recursos = await obtenerRecursos(estudianteCargaId);
    
    // Mostrar recursos
    recursos.forEach(r => {
      console.log(`
        📎 Recurso: ${r.descripcion}
        Tipo: ${r.tipo_recurso}
        URL: ${r.archivo_url}
        Creado: ${new Date(r.fecha_creacion).toLocaleString()}
      `);
    });
    
    return recursos;
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Exportar funciones para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    agregarDerivacion,
    eliminarDerivacion,
    obtenerDerivaciones,
    agregarRecursoArchivo,
    agregarRecursoURL,
    obtenerRecursos,
    actualizarRecursoDescripcion,
    actualizarRecursoArchivo,
    actualizarRecursoURL,
    eliminarRecurso,
    descargarRecurso
  };
}
