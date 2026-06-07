import { describe, it, expect } from 'vitest';
import { esEmailValido, calcularNivelRiesgo } from '../src/utils/validaciones.js';
import { getDerivacionesByCarga } from '../src/controllers/derivacionController.js';

describe('Pruebas de Lógica Pura - Sin Base de Datos', () => {

  it('Debería rechazar un correo con formato incorrecto', () => {
    expect(esEmailValido('correo-sin-arroba.com')).toBe(false);
    expect(esEmailValido('')).toBe(false);
  });

  it('Debería aceptar un correo institucional correcto', () => {
    expect(esEmailValido('estudiante@correo.edu.co')).toBe(true);
  });

  it('Debería catalogar como CRÍTICO si falta 5 o más días', () => {
    expect(calcularNivelRiesgo(6)).toBe('CRÍTICO');
  });

  it('Debería catalogar como BAJO si falta menos de 3 días', () => {
    expect(calcularNivelRiesgo(1)).toBe('BAJO');
  });
});
