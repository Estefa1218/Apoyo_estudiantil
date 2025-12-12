import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './Appfigma';
import './styles/globals.css'; // ← solo este archivo debe tener @tailwind

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);