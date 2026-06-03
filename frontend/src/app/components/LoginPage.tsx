import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Eye, EyeOff, LogIn } from 'lucide-react';

type Props = {
  onLogin: (email: string, name: string) => void;
};

export function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación básica
    if (!email || !password) {
      setError('Por favor, completa todos los campos');
      return;
    }

    if (!email.includes('@')) {
      setError('Por favor, ingresa un correo electrónico válido');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Simular login exitoso (en producción esto sería una llamada a la API)
    setError('');
    // Extraer nombre del email para demo
    const name = email.split('@')[0];
    onLogin(email, name.charAt(0).toUpperCase() + name.slice(1));
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#F4F7FA' }}
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Sistema de Seguimiento Estudiantil</CardTitle>
          <CardDescription>Ingresa tus credenciales para acceder al sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className={error ? 'border-red-500' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className={error ? 'border-red-500' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <Button type="submit" className="w-full">
              <LogIn className="w-4 h-4 mr-2" />
              Iniciar Sesión
            </Button>

            <div className="text-center">
              <a
                href="#"
                className="text-sm underline"
                style={{ color: '#2563EB' }}
                onClick={(e) => {
                  e.preventDefault();
                  alert('Contacta al administrador del sistema para recuperar tu contraseña');
                }}
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-center" style={{ color: '#64748B' }}>
                Demo: Usa cualquier correo válido y una contraseña de 6+ caracteres
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
