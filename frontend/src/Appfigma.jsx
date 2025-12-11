import React, { useState, useRef, useEffect } from 'react';
import './styles/globals.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Calendar as CalendarComponent } from './components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover';
import { 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Hourglass, 
  Calendar, 
  Loader2,
  Download 
} from 'lucide-react';

export default function Appfigma() {
  const [state, setState] = useState('empty'); // 'empty' | 'uploading' | 'processing' | 'ready' | 'upload-error' | 'date-error' | 'download-error'
  const [isDragging, setIsDragging] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startDateValue, setStartDateValue] = useState(undefined);
  const [endDateValue, setEndDateValue] = useState(undefined);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [dateError, setDateError] = useState('');
  const [uploadErrorMessage, setUploadErrorMessage] = useState('');
  const [dateRangeInfo, setDateRangeInfo] = useState(null);
  const fileInputRef = useRef(null);

  // Funciones helper para convertir fechas
  const formatDateToString = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const parseStringToDate = (dateStr) => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return undefined;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return undefined;
    return new Date(year, month, day);
  };

  // Validar rango de fechas en tiempo real
  useEffect(() => {
    if (startDate && endDate) {
      const startDateObj = parseStringToDate(startDate);
      const endDateObj = parseStringToDate(endDate);
      
      if (startDateObj && endDateObj && startDateObj <= endDateObj) {
        const diffTime = Math.abs(endDateObj.getTime() - startDateObj.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDateRangeInfo({ valid: diffDays >= 8, days: diffDays });
      } else {
        setDateRangeInfo(null);
      }
    } else {
      setDateRangeInfo(null);
    }
  }, [startDate, endDate]);

  // Simular progreso de procesamiento
  useEffect(() => {
    if (state === 'uploading') {
      const timer = setTimeout(() => {
        setState('processing');
      }, 1000);
      return () => clearTimeout(timer);
    }
    if (state === 'processing') {
      const timer = setTimeout(() => {
        setState('ready');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = (file) => {
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    
    if (!isExcel) {
      setUploadErrorMessage('El formato del archivo es incorrecto. Asegúrate de usar un archivo .xlsx o .xls');
      setState('upload-error');
      return;
    }

    const random = Math.random();
    
    if (random > 0.7) {
      const errorType = Math.floor(Math.random() * 3);
      
      if (errorType === 0) {
        setUploadErrorMessage('Faltan columnas obligatorias en el archivo. Por favor, verifica la plantilla.');
      } else if (errorType === 1) {
        setUploadErrorMessage('El archivo está corrupto o no se puede leer. Intenta con otro archivo.');
      } else {
        setUploadErrorMessage('Error de conexión al servidor. Por favor, intenta nuevamente.');
      }
      
      setState('upload-error');
    } else {
      setUploadErrorMessage('');
      setState('uploading');
    }
  };

  const handleSelectFileClick = () => {
    fileInputRef.current?.click();
  };

  const validateDateRange = (start, end) => {
    if (!start || !end) {
      setDateError('Por favor, ingresa ambas fechas.');
      return false;
    }

    const startDateObj = parseStringToDate(start);
    const endDateObj = parseStringToDate(end);

    if (!startDateObj || !endDateObj) {
      setDateError('Formato de fecha inválido. Use DD-MM-YYYY.');
      return false;
    }

    if (startDateObj > endDateObj) {
      setDateError('La fecha de inicio debe ser anterior a la fecha de fin.');
      return false;
    }

    const diffTime = Math.abs(endDateObj.getTime() - startDateObj.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 8) {
      setDateError(`El rango actual es de ${diffDays} días. El mínimo requerido es de 8 días.`);
      return false;
    }

    const hasData = Math.random() > 0.1;
    if (!hasData) {
      setDateError('No se encontraron reportes disponibles para el rango de fechas seleccionado.');
      setState('date-error');
      return false;
    }

    setDateError('');
    return true;
  };

  const handleDownload = () => {
    if (validateDateRange(startDate, endDate)) {
      const downloadFails = Math.random() > 0.8;
      
      if (downloadFails) {
        setDateError('Error al generar el reporte. El servidor no responde. Por favor, intenta nuevamente en unos minutos.');
        setState('download-error');
      } else {
        setDateError('');
        alert('¡Descargando reporte de seguimiento estudiantil exitosamente!');
      }
    } else {
      setState('date-error');
    }
  };

  const isUploadSuccess = state === 'uploading' || state === 'processing' || state === 'ready';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F4F7FA' }}>
      <div className="container mx-auto px-20 py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="mb-2" style={{ color: '#2563EB' }}>
            Sistema de Seguimiento Estudiantil
          </h1>
          <p style={{ color: '#64748B' }}>
            Gestión y seguimiento de estudiantes
          </p>
        </div>

        {/* Date Filters - Top Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filtros de Reporte</CardTitle>
            <CardDescription>
              Selecciona el rango de fechas para generar el reporte de seguimiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Fecha de Inicio</Label>
                  <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                    <PopoverTrigger asChild>
                      <div className="relative">
                        <Input
                          id="start-date"
                          type="text"
                          placeholder="DD-MM-YYYY"
                          value={startDate}
                          onChange={(e) => {
                            const value = e.target.value;
                            setStartDate(value);
                            setDateError('');
                            if (state === 'date-error' || state === 'download-error') setState('ready');
                            const parsedDate = parseStringToDate(value);
                            if (parsedDate) {
                              setStartDateValue(parsedDate);
                            }
                          }}
                          disabled={state !== 'ready' && state !== 'date-error' && state !== 'download-error'}
                          className={dateError ? 'border-red-500' : ''}
                        />
                        <button
                          type="button"
                          onClick={() => setStartDateOpen(!startDateOpen)}
                          disabled={state !== 'ready' && state !== 'date-error' && state !== 'download-error'}
                          className="absolute right-3 top-1/2 -translate-y-1/2 disabled:opacity-50"
                        >
                          <Calendar className="w-5 h-5" style={{ color: '#64748B' }} />
                        </button>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={startDateValue}
                        onSelect={(date) => {
                          if (date) {
                            setStartDateValue(date);
                            setStartDate(formatDateToString(date));
                            setStartDateOpen(false);
                            setDateError('');
                            if (state === 'date-error' || state === 'download-error') setState('ready');
                          }
                        }}
                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end-date">Fecha de Fin</Label>
                  <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                    <PopoverTrigger asChild>
                      <div className="relative">
                        <Input
                          id="end-date"
                          type="text"
                          placeholder="DD-MM-YYYY"
                          value={endDate}
                          onChange={(e) => {
                            const value = e.target.value;
                            setEndDate(value);
                            setDateError('');
                            if (state === 'date-error' || state === 'download-error') setState('ready');
                            const parsedDate = parseStringToDate(value);
                            if (parsedDate) {
                              setEndDateValue(parsedDate);
                            }
                          }}
                          disabled={state !== 'ready' && state !== 'date-error' && state !== 'download-error'}
                          className={dateError ? 'border-red-500' : ''}
                        />
                        <button
                          type="button"
                          onClick={() => setEndDateOpen(!endDateOpen)}
                          disabled={state !== 'ready' && state !== 'date-error' && state !== 'download-error'}
                          className="absolute right-3 top-1/2 -translate-y-1/2 disabled:opacity-50"
                        >
                          <Calendar className="w-5 h-5" style={{ color: '#64748B' }} />
                        </button>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={endDateValue}
                        onSelect={(date) => {
                          if (date) {
                            setEndDateValue(date);
                            setEndDate(formatDateToString(date));
                            setEndDateOpen(false);
                            setDateError('');
                            if (state === 'date-error' || state === 'download-error') setState('ready');
                          }
                        }}
                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {dateError ? (
                <p className="text-red-600">{dateError}</p>
              ) : dateRangeInfo ? (
                dateRangeInfo.valid ? (
                  <p className="text-green-600">
                    ✓ Rango válido: {dateRangeInfo.days} días seleccionados. Puedes descargar el reporte.
                  </p>
                ) : (
                  <p className="text-orange-600">
                    Rango actual: {dateRangeInfo.days} días. Se requieren al menos 8 días.
                  </p>
                )
              ) : (
                <p style={{ color: '#64748B' }}>
                  El rango mínimo para descargar es de 8 días.
                </p>
              )}

              <Button 
                onClick={handleDownload}
                disabled={state !== 'ready' && state !== 'date-error' && state !== 'download-error'}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar Reporte
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Card 1: Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>1. Cargar archivo de estudiantes</CardTitle>
              <CardDescription>
                Sube el archivo Excel con los parámetros definidos.{' '}
                <a 
                  href="#" 
                  className="underline" 
                  style={{ color: '#2563EB' }}
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Descargando plantilla de ejemplo...');
                  }}
                >
                  Descargar plantilla de ejemplo
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isUploadSuccess ? (
                <div className="flex items-center gap-3 p-6 rounded-lg bg-green-50">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span style={{ color: '#0F172A' }}>
                    ¡Archivo cargado con éxito!
                  </span>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className="rounded-lg transition-all"
                  style={{
                    border: state === 'upload-error' 
                      ? '2px dashed #EF4444' 
                      : isDragging 
                      ? '2px dashed #2563EB' 
                      : '2px dashed #CBD5E1',
                    backgroundColor: state === 'upload-error'
                      ? '#FEF2F2'
                      : isDragging
                      ? '#EFF6FF'
                      : '#FFFFFF',
                    padding: '48px 24px',
                  }}
                >
                  <div className="flex flex-col items-center justify-center gap-4">
                    {state === 'upload-error' ? (
                      <>
                        <AlertCircle className="w-12 h-12 text-red-600" />
                        <p className="text-center" style={{ color: '#EF4444' }}>
                          Error: {uploadErrorMessage}
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-12 h-12" style={{ color: '#2563EB' }} />
                        <p style={{ color: '#64748B' }}>
                          Arrastra tu archivo Excel aquí
                        </p>
                      </>
                    )}
                    
                    <p style={{ color: '#64748B' }}>o</p>
                    
                    <Button onClick={handleSelectFileClick}>
                      Seleccionar Archivo
                    </Button>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 2: Error Details (Only shown when upload fails) */}
          {state === 'upload-error' && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-700">2. Error en la Carga de Archivo</CardTitle>
                <CardDescription className="text-red-600">
                  Se detectó un problema con el archivo enviado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-red-200">
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <div className="space-y-2 flex-1">
                      <p style={{ color: '#DC2626' }}>
                        <strong>Error detectado:</strong> {uploadErrorMessage}
                      </p>
                      <p style={{ color: '#64748B' }}>
                        Verifica que el archivo cumpla con todos los requisitos
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-red-200">
                    <p style={{ color: '#0F172A', marginBottom: '8px' }}>
                      <strong>Posibles causas:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1" style={{ color: '#64748B' }}>
                      <li>El archivo no tiene la extensión .xlsx o .xls</li>
                      <li>El archivo está corrupto o dañado</li>
                      <li>Faltan columnas obligatorias en el archivo</li>
                      <li>El formato de datos no coincide con la plantilla</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-red-200">
                    <p style={{ color: '#0F172A', marginBottom: '8px' }}>
                      <strong>Acciones recomendadas:</strong>
                    </p>
                    <ol className="list-decimal list-inside space-y-1" style={{ color: '#64748B' }}>
                      <li>Descarga la plantilla de ejemplo desde la sección superior</li>
                      <li>Verifica que tu archivo tenga el formato correcto</li>
                      <li>Asegúrate de incluir todas las columnas requeridas</li>
                      <li>Intenta subir el archivo nuevamente</li>
                    </ol>
                  </div>

                  <Button 
                    onClick={() => setState('empty')}
                    variant="outline"
                    className="w-full border-red-300 text-red-700 hover:bg-red-100"
                  >
                    Intentar de Nuevo
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Card 3: Download Error */}
          {state === 'download-error' && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-700">
                  {state === 'upload-error' ? '3' : '2'}. Error al Generar el Reporte
                </CardTitle>
                <CardDescription className="text-orange-600">
                  No se pudo completar la descarga del reporte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-orange-200">
                    <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                    <div className="space-y-2 flex-1">
                      <p style={{ color: '#EA580C' }}>
                        <strong>Error al descargar:</strong> {dateError}
                      </p>
                      <p style={{ color: '#64748B' }}>
                        El sistema no pudo generar el reporte solicitado
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-orange-200">
                    <p style={{ color: '#0F172A', marginBottom: '8px' }}>
                      <strong>Posibles causas:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1" style={{ color: '#64748B' }}>
                      <li>El servidor está temporalmente no disponible</li>
                      <li>Problemas de conexión a internet</li>
                      <li>El rango de fechas contiene demasiados registros</li>
                      <li>Error temporal en el procesamiento de datos</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-orange-200">
                    <p style={{ color: '#0F172A', marginBottom: '8px' }}>
                      <strong>Qué puedes hacer:</strong>
                    </p>
                    <ol className="list-decimal list-inside space-y-1" style={{ color: '#64748B' }}>
                      <li>Espera unos minutos e intenta nuevamente</li>
                      <li>Verifica tu conexión a internet</li>
                      <li>Prueba con un rango de fechas más pequeño</li>
                      <li>Si el problema persiste, contacta al soporte técnico</li>
                    </ol>
                  </div>

                  <Button 
                    onClick={handleDownload}
                    variant="outline"
                    className="w-full border-orange-300 text-orange-700 hover:bg-orange-100"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Reintentar Descarga
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Card 4: Status Section */}
          <Card>
            <CardHeader>
              <CardTitle>
                {(state === 'upload-error' || state === 'download-error') ? '3' : '2'}. Estado del Procesamiento
              </CardTitle>
              <CardDescription>
                Visualiza el estado actual del procesamiento de datos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(state === 'empty' || state === 'upload-error') && (
                <div className="flex flex-col items-center justify-center gap-3 p-12 bg-gray-50 rounded-lg">
                  <Hourglass className="w-12 h-12" style={{ color: '#CBD5E1' }} />
                  <p style={{ color: '#CBD5E1' }}>
                    No hay reportes disponibles
                  </p>
                  <p style={{ color: '#CBD5E1' }}>
                    Sube un archivo de estudiantes para comenzar
                  </p>
                </div>
              )}
              
              {(state === 'uploading' || state === 'processing') && (
                <div className="flex flex-col items-center justify-center gap-3 p-12 bg-blue-50 rounded-lg">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                  <p style={{ color: '#0F172A' }}>
                    Procesando datos...
                  </p>
                  <p style={{ color: '#64748B' }}>
                    Este reporte puede tardar hasta 48 horas en generarse.
                  </p>
                </div>
              )}

              {(state === 'ready' || state === 'date-error' || state === 'download-error') && (
                <div className="flex flex-col items-center justify-center gap-3 p-12 bg-green-50 rounded-lg">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                  <p style={{ color: '#0F172A' }}>
                    Datos procesados correctamente
                  </p>
                  <p style={{ color: '#64748B' }}>
                    Selecciona un rango de fechas arriba para descargar el reporte
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}