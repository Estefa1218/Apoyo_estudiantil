import { useState } from 'react';
import { Menu, X, FileText, Settings, LogOut, ChevronRight, User } from 'lucide-react';

type MenuItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

type Props = {
  currentPage: string;
  onPageChange: (pageId: string) => void;
  userName: string;
  userEmail: string;
  onLogout: () => void;
};

const menuItems: MenuItem[] = [
  {
    id: 'reports',
    label: 'Reportería',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    id: 'absence-management',
    label: 'Gestión de Ausentismos',
    icon: <Settings className="w-5 h-5" />,
  },
];

export function Sidebar({ currentPage, onPageChange, userName, userEmail, onLogout }: Props) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* Hamburger button - Mobile/Desktop toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg hover:bg-gray-50 transition-colors"
        style={{ border: '1px solid #E2E8F0' }}
      >
        {isOpen ? (
          <X className="w-6 h-6" style={{ color: '#2563EB' }} />
        ) : (
          <Menu className="w-6 h-6" style={{ color: '#2563EB' }} />
        )}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-xl z-40 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: '280px', borderRight: '1px solid #E2E8F0' }}
      >
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: '#E2E8F0' }}>
          <h2 className="font-bold text-lg" style={{ color: '#2563EB' }}>
            Sistema Estudiantil
          </h2>
          <p className="text-sm mt-1" style={{ color: '#64748B' }}>
            Gestión y seguimiento
          </p>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onPageChange(item.id);
                // Close on mobile after selecting
                if (window.innerWidth < 1024) {
                  setIsOpen(false);
                }
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                currentPage === item.id
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </div>
              {currentPage === item.id && <ChevronRight className="w-5 h-5" />}
            </button>
          ))}
        </nav>

        {/* User Session Section */}
        <div className="border-t" style={{ borderColor: '#E2E8F0' }}>
          <div className="p-4 space-y-3">
            {/* User Info */}
            <div className="flex items-center gap-3 px-2">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: '#2563EB' }}
              >
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate" style={{ color: '#0F172A' }}>
                  {userName}
                </p>
                <p className="text-xs truncate" style={{ color: '#64748B' }}>
                  {userEmail}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
