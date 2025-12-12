// src/components/DownloadSection.jsx
import React, { useState } from 'react';

const DownloadSection = ({ processedFileUrl, fileName }) => {
  const [isLoading, setIsLoading] = useState(true);

  // Simulación: después de 3 segundos, el archivo está listo
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Simula proceso de 3 segundos
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <h3 className="text-lg font-semibold mb-2">📥 Descargar Seguimiento</h3>
      <p className="text-sm text-gray-600 mb-4">
        Descarga el archivo procesado con el seguimiento de estudiantes.
      </p>

      {isLoading ? (
        <div className="bg-gray-100 rounded-md py-4 flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 mr-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.644z"></path>
          </svg>
          Esperando archivo procesado...
        </div>
      ) : (
        <a
          href={processedFileUrl || '#'}
          download={fileName || 'seguimiento_estudiantes.xlsx'}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7h2a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h2" />
          </svg>
          Descargar Archivo
        </a>
      )}
    </div>
  );
};

export default DownloadSection;