// src/utils/validaciones.js
export const esEmailValido = (email) => {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const calcularNivelRiesgo = (diasAusente) => {
  if (diasAusente >= 5) return 'CRÍTICO';
  if (diasAusente >= 3) return 'MEDIO';
  return 'BAJO';
};