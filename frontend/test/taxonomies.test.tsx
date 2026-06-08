import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AbsenceManagementPage } from '../src/app/components/AbsenceManagementPanel.tsx';

// 1. MOCK DE ICONOS (Lucide React)
vi.mock('lucide-react', () => ({
  Plus: () => <span>[Plus]</span>,
  Trash2: () => <span>[Trash]</span>,
  Edit2: () => <span>[Edit]</span>,
  Save: () => <span>[Save]</span>,
  FileText: () => <span>[FileText]</span>,
  Settings: () => <span>[Settings]</span>,
}));

// 2. LA SOLUCIÓN AL ERROR DE LA LÍNEA 5: Interceptamos las tarjetas de Shadcn
vi.mock('../src/app/components/ui/card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
  CardDescription: ({ children }: any) => <p>{children}</p>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));

// 3. Mockeamos también los inputs y botones para evitar problemas con sus referencias internas
vi.mock('../src/app/components/ui/label', () => ({
  Label: ({ children, htmlFor, className }: any) => (
    <label htmlFor={htmlFor} className={className}>{children}</label>
  ),
}));

vi.mock('../src/app/components/ui/input', () => ({
  Input: ({ placeholder, value, onChange }: any) => (
    <input placeholder={placeholder} value={value} onChange={onChange} />
  ),
}));

describe('Frontend - Pruebas del Panel de Ausentismos', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('AAA - Debería mostrar el encabezado y las 4 pestañas de gestión', () => {
    render(<AbsenceManagementPage />);
    expect(screen.getByText('Gestión de Ausentismos')).toBeDefined();
    expect(screen.getByRole('button', { name: /1\. Taxonomías/i })).toBeDefined();
  });

  test('AAA - Debería permitir escribir una nueva taxonomía en el input', () => {
    render(<AbsenceManagementPage />);
    const input = screen.getByPlaceholderText('Nombre de la taxonomía') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Inasistencia Académica' } });
    expect(input.value).toBe('Inasistencia Académica');
  });
});