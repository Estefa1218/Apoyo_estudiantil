// src/components/FileUploader.jsx
import React, { useState } from 'react';

const FileUploader = ({ onFileUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.xlsx')) {
      setSelectedFile(file);
      onFileUpload(file);
    } else {
      alert('Por favor, sube un archivo Excel (.xlsx)');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.xlsx')) {
      setSelectedFile(file);
      onFileUpload(file);
    } else {
      alert('Por favor, sube un archivo Excel (.xlsx)');
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6v6H9v-6z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l-4 4m0 0l-4-4m4 4v12" />
        </svg>
      </div>
      <p className="text-sm text-gray-600 mb-2">Arrastra tu archivo Excel aquí</p>
      <p className="text-xs text-gray-400 mb-4">o</p>
      <label className="bg-white text-blue-600 px-4 py-2 rounded-md cursor-pointer hover:bg-blue-50">
        Seleccionar Archivo
        <input
          type="file"
          accept=".xlsx"
          onChange={handleFileSelect}
          className="hidden"
        />
      </label>
      {selectedFile && (
        <p className="mt-4 text-sm text-green-600">✅ {selectedFile.name}</p>
      )}
    </div>
  );
};

export default FileUploader;