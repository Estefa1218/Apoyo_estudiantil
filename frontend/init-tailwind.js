// init-tailwind.js
const { execSync } = require('child_process');
const path = require('path');

try {
  const result = execSync('npx tailwindcss init -p', { stdio: 'inherit', cwd: process.cwd() });
} catch (e) {
  console.error('Error al inicializar Tailwind CSS');
  process.exit(1);
}