// src/App.js
import React, { useState } from 'react';
import './App.css';
/*login*/
import Login from "./login";
/*hasta aqui*/ 

function App() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [processedFileUrl, setProcessedFileUrl] = useState(null);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  /*login*/
  const [isLogged, setIsLogged] = useState(false);
  if (!isLogged) {
    return <Login onLogin={() => setIsLogged(true)} />;
  /*hasta aqui*/ 
  }

  const handleFileSelect = (file) => {
    if (file && file.name.endsWith('.xlsx')) {
      setUploadedFile(file);
      setFileName(file.name.replace('.xlsx', '_procesado.xlsx'));
      setUploadMessage('');
      setProcessedFileUrl(null);
    } else {
      alert('Por favor, sube un archivo Excel (.xlsx)');
    }
  };

  const handleUploadToBackend = async () => {
    if (!uploadedFile) return;

    const formData = new FormData();
    formData.append('excelFile', uploadedFile);

    setUploading(true);
    setUploadMessage('Subiendo archivo...');

    try {
      const response = await fetch('https://apoyoestudiantilibero1234.onrender.com/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadMessage('✅ Archivo subido exitosamente. El procesamiento ha comenzado.');
        // Simulamos descarga (en producción, aquí pedirías el archivo real)
        setTimeout(() => {
          setProcessedFileUrl(`data:text/plain;charset=utf-8,${encodeURIComponent('Archivo de seguimiento simulado')}`);
        }, 2000);
      } else {
        setUploadMessage(`❌ Error: ${result.error || 'Falló la subida'}`);
        console.error('Error del backend:', result);
      }
    } catch (error) {
      setUploadMessage('❌ Error de conexión con el servidor. ¿Está el backend corriendo?');
      console.error('Error de red:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Sistema de Seguimiento Estudiantil</h1>
        <p>Gestión y seguimiento de estudiantes</p>
      </header>

      <main className="main-content">
        {/* Sección 1: Subir Archivo */}
        <section className="card">
          <h2>⬆️ Subir Archivo Excel</h2>
          <p className="description">Selecciona o arrastra el archivo Excel con la información de los estudiantes</p>

          <div
            className={`drop-zone ${uploadedFile ? 'has-file' : ''}`}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              handleFileSelect(file);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 13h6v6H9v-6zm3-8L17 10l-5 5H7v-5l5-5z"/>
            </svg>
            <p>Arrastra tu archivo Excel aquí</p>
            <p className="or">o</p>
            <label className="file-input-btn">
              Seleccionar Archivo
              <input
                type="file"
                accept=".xlsx"
                onChange={(e) => handleFileSelect(e.target.files[0])}
              />
            </label>
            {uploadedFile && (
              <p className="file-name">📄 {uploadedFile.name}</p>
            )}
          </div>

          {uploadMessage && (
            <p className={`upload-message ${uploadMessage.includes('✅') ? 'success' : 'error'}`}>
              {uploadMessage}
            </p>
          )}

          <button
            onClick={handleUploadToBackend}
            className="upload-btn"
            disabled={!uploadedFile || uploading}
          >
            {uploading ? (
              <>
                <svg className="spinner-btn" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.644z"></path>
                </svg>
                Subiendo...
              </>
            ) : (
              '⬆️ Subir Archivo Excel'
            )}
          </button>
        </section>

        {/* Sección 2: Descargar Seguimiento */}
        <section className="card">
          <h2>📥 Descargar Seguimiento</h2>
          <p className="description">Descarga el archivo procesado con el seguimiento de estudiantes.</p>

          {processedFileUrl ? (
            <a
              href={processedFileUrl}
              download={fileName || 'seguimiento_estudiantes.xlsx'}
              className="download-btn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2M5 12h14l-3-3H8l-3 3z"/>
              </svg>
              Descargar Archivo
            </a>
          ) : (
            <div className="loading-placeholder">
              <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.644z"></path>
              </svg>
              Esperando archivo procesado...
            </div>
          )}
        </section>
      </main>
    </div>
  );
}




export default App;