import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { ReportsPage } from './components/ReportsPage';
import { AbsenceManagementPage } from './components/AbsenceManagementPanel';

type User = {
  email: string;
  name: string;
} | null;

export default function App() {
  const [user, setUser] = useState<User>(null);
  const [currentPage, setCurrentPage] = useState('reports');

  // Cargar usuario desde localStorage al montar
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (email: string, name: string) => {
    const newUser = { email, name };
    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      setUser(null);
      localStorage.removeItem('currentUser');
      setCurrentPage('reports');
    }
  };

  // Si no hay usuario, mostrar login
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F4F7FA' }}>
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        userName={user.name}
        userEmail={user.email}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="lg:pl-[280px]">
        <div className="container mx-auto px-6 lg:px-12 py-12 pt-20 lg:pt-12 max-w-7xl">
          {currentPage === 'reports' && <ReportsPage />}
          {currentPage === 'absence-management' && <AbsenceManagementPage />}
        </div>
      </div>
    </div>
  );
}
