import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LoginPage } from './LoginPage';

describe('LoginPage', () => {
  it('shows validation errors and calls onLogin for valid credentials', async () => {
    const onLogin = vi.fn();
    const user = userEvent.setup();

    render(<LoginPage onLogin={onLogin} />);

    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    expect(screen.getByText(/completa todos los campos/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/correo electrónico/i), 'invalid-email');
    await user.type(screen.getByLabelText(/contraseña/i), '12345');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    expect(screen.getByText(/correo electrónico válido/i)).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/correo electrónico/i));
    await user.clear(screen.getByLabelText(/contraseña/i));
    await user.type(screen.getByLabelText(/correo electrónico/i), 'test@example.com');
    await user.type(screen.getByLabelText(/contraseña/i), '123456');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(onLogin).toHaveBeenCalledWith('test@example.com', 'Test');
  });
});
