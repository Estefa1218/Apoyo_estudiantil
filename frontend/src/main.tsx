import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './Appfigma';
import Login from './login.jsx';
import './styles/globals.css'; // ← solo este archivo debe tener @tailwind

const Root = () => {
  console.log('Root render: isAuthenticated check');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    try {
      if (isAuthenticated) localStorage.setItem('isAuthenticated', 'true');
      else localStorage.removeItem('isAuthenticated');
    } catch (e) {
      // ignore localStorage errors
    }
  }, [isAuthenticated]);

  const handleLogin = () => setIsAuthenticated(true);

  return (
    <React.StrictMode>
      {isAuthenticated ? <App /> : <Login onLogin={handleLogin} />}
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />);