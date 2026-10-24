import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';

vi.mock('@/app/components/ui/button', () => ({
  Button: ({ children, onClick, className }: any) => (
    <button onClick={onClick} className={className}>{children}</button>
  ),
}));

vi.mock('@/app/components/ui/input', () => ({
  Input: ({ id, type, placeholder, value, onChange }: any) => (
    <input id={id} type={type} placeholder={placeholder} value={value} onChange={onChange} />
  ),
}));

vi.mock('@/app/components/ui/label', () => ({
  Label: ({ children, htmlFor }: any) => <label htmlFor={htmlFor}>{children}</label>,
}));

vi.mock('@/app/components/ui/card', () => ({
  Card: ({ children }: any) => <div className="bg-card">{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
  CardDescription: ({ children }: any) => <p>{children}</p>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardFooter: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('lucide-react', () => ({
  Mail: () => <span>[Mail]</span>,
  Lock: () => <span>[Lock]</span>,
  LogIn: () => <span>[LogIn]</span>, 
  Eye: () => <span>[Eye]</span>,
  EyeOff: () => <span>[EyeOff]</span>,
}));
import { LoginPage } from '@/app/components/LoginPage';

describe('Frontend - Pruebas del Login', () => {

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  test('Debería permitir escribir el correo y contraseña simulados', () => {
    const mockOnLogin = vi.fn();
    const { container } = render(<LoginPage onLogin={mockOnLogin} />);

    
    const inputCorreo = container.querySelector('#email') as HTMLInputElement;
    const inputContrasena = container.querySelector('#password') as HTMLInputElement;
    
    expect(inputCorreo).toBeDefined();
    expect(inputContrasena).toBeDefined();
    fireEvent.change(inputCorreo, { target: { value: 'correo@algo.com' } });
    fireEvent.change(inputContrasena, { target: { value: 'quwebqwebq' } });
    expect(inputCorreo.value).toBe('correo@algo.com');
    expect(inputContrasena.value).toBe('quwebqwebq');
  });

});