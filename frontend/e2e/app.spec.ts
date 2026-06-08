import { test, expect } from '@playwright/test';

test.describe('Flujos completos del Sistema (E2E)', () => {

  // PRUEBA 1: Flujo de creación de taxonomía
  test('Usuario puede crear una taxonomía nueva', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[placeholder="Nombre de la taxonomía"]', 'Académico');
    await page.click('text=Agregar');
    await expect(page.locator('text=Académico')).toBeVisible();
  });

  // PRUEBA 2: Validación de formulario (Ej: tipo de recurso)
  test('El sistema impide guardar un recurso sin descripción', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.click('text=Agregar Recurso');
    // Intentamos guardar vacío
    await page.click('button:has-text("Guardar")');
    await expect(page.locator('.error-message')).toBeVisible();
  });

  // PRUEBA 3: Persistencia (Integración)
  test('Los datos persisten tras recargar la página', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input', 'Test Persistencia');
    await page.click('text=Agregar');
    await page.reload();
    await expect(page.locator('text=Test Persistencia')).toBeVisible();
  });
});