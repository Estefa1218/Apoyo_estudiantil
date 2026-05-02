🎓 PAE - Sistema de Acompañamiento Estudiantil
🫂 El Propósito: Humanizar la Tecnología

Este sistema no es una herramienta de vigilancia. Nace bajo la premisa de que la tecnología debe ser un puente, no un muro. Su objetivo es automatizar la detección técnica de ausentismo para permitir que el equipo humano actúe donde realmente importa: el primer contacto.

    "Buscamos que ningún estudiante sea invisible. El sistema detecta la ausencia, pero el profesional brinda el apoyo."

🎨 Diseño y Prototipado (UX/UI)

La interfaz fue concebida para ser intuitiva y reducir la carga cognitiva del personal administrativo.

    Prototipo en Figma: 🔗https://www.figma.com/make/CNNutMGNkLWjCSO88GrUlO/Sistema-de-Seguimiento-Estudiantil?t=JNUbqaMt4nR12k3R-1 -> Ver diseño interactivo

    Enfoque: Accesibilidad, claridad en el estado de las cargas y visualización de errores amigable.

🏗️ Arquitectura del Sistema

El sistema se divide en tres componentes principales:

    Frontend (React + Vite): Interfaz de usuario moderna, responsiva y validada para la gestión de reportes y carga de archivos.

    Backend (Express + Node.js): API REST robusta que procesa archivos Excel, gestiona lógica de negocio y automatiza el envío de correos electrónicos.

    Base de Datos (MySQL): Esquema relacional con soporte para transacciones ACID y auditoría completa de eventos.

🌟 Funcionalidades Estrella

    Smart Mapping: No importa cómo se llamen las columnas de tu Excel ("Email", "Correo", "Mail"), el sistema las identifica automáticamente.

    Cálculo Dinámico: Si el reporte solo tiene la "Última Conexión", el backend calcula los días de ausencia en tiempo real.

    Garantía de Datos: Gracias al sistema de transacciones, si un solo dato falla en la carga masiva, el sistema realiza un rollback para mantener la integridad.

    Ciclo de Vida del Estudiante: Seguimiento desde que se envía el correo hasta que el estudiante responde o se marca como "no responde".


🚀 Funcionalidades Principales

⚙️ Procesamiento Inteligente (Backend)

    Mapeo Flexible de Columnas: Detecta automáticamente campos como Nombre Completo, Email o Días Ausente, incluso con variaciones en los títulos del Excel.

    Cálculo Dinámico de Ausencia: Si el archivo contiene "última conexión" en lugar de "días", el sistema calcula la diferencia automáticamente.

    Integridad y Auditoría: Cada carga registra un historial detallado y cuenta con rollback automático para evitar datos inconsistentes.

📊 Gestión de Acompañamiento (Frontend)

    Dashboard de Seguimiento: Visualización del estado de los estudiantes (Pendiente, Enviado, Respondido, No Responde).

    Carga Masiva Validada: Feedback en tiempo real sobre filas con errores (emails mal formados o campos vacíos).

    Generación de Reportes: Filtros avanzados para análisis de impacto.

🏗️ Estructura del Proyecto

SISTEMA-PAE/
├── backend/          # API REST y Procesamiento de datos
│   ├── src/          # Lógica, servicios y controladores
│   ├── .env.example  # Configuración de DB y SMTP
│   └── README.md     # Documentación técnica del servidor
├── frontend/         # Interfaz de Usuario
│   ├── src/          # Componentes y Hooks
│   └── README.md     # Guía de estilos y despliegue
└── database/         # Scripts de creación y auditoría

🧪 Control de Calidad 

Como parte de un enfoque de ingeniería de software robusto, el sistema maneja:

    Validación de Datos: Sanitización de inputs y validación estricta de formatos.

    Manejo de Errores Parciales: Si un Excel de 100 estudiantes tiene 2 errores, el sistema procesa los 98 válidos e informa los detalles de los fallidos.

    Logs Detallados: Trazabilidad total de cada evento de carga y envío de correos.

🏁 Instalación Rápida

    Clonar repositorio: git clone https://github.com/tu-usuario/sistema-pae.git

    Backend:
    Bash

    cd backend && npm install
    # Configura tu .env y ejecuta sistema_pae.sql
    npm run dev

    Frontend:
    Bash

    cd frontend && npm install
    npm run dev

