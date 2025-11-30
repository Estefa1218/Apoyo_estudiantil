# 📘 Sistema de Acompañamiento Estudiantil

Repositorio: **Apoyo_estudiantil-master**

Participantes:

👩‍💼Estefanía Lizcano González

🧑‍💼Pablo David Benavides Tunjano

🧑‍💼Samuel Gaviria Morales


Este proyecto implementa hasta el momento una aplicación web básica para gestionar el
acompañamiento estudiantil.
Actualmente incluye un backend en Node.js y un frontend en
React, con funcionalidades iniciales enfocadas en carga de información y envio de correos.

------------------------------------------------------------------------

## 📂 Estructura del proyecto

    Apoyo_estudiantil-master
    │
    ├── backend                      
    │   ├── config
    │   │   └── db.js                  
    │   ├── controllers
    │   │   └── uploadController.js    
    │   ├── .env                       
    │   ├── package.json
    │   └── server.js                  
    │
    └── sistema-acompanamiento-estudiantil   
        ├── public
        ├── src
        │   ├── components
        │   │   ├── FileUploader.jsx   
        │   │   └── DownloadSection.jsx
        │   ├── App.js
        │   └── index.js
        ├── package.json
        └── README.md

------------------------------------------------------------------------

## 🚀 Funcionalidades actualmente disponibles

### 🔹 Backend (Node.js + Express)

#### ✔ Subida de archivos

-   Recibe archivos mediante **Multer**.
-   Los almacena en el servidor.
-   Retorna información del archivo subido.

#### ✔ API básica

-   Inicializa servidor Express
-   Habilita CORS
-   Define rutas de carga de archivos
-   Carga variables desde `.env`

------------------------------------------------------------------------

## 🎨 Frontend (React)

### ✔ Subida de archivos (UI)

-   Permite seleccionar y subir archivos al backend
-   Muestra mensajes de éxito o error

### ✔ Descarga de archivos

-   Sección para descargar archivos alojados en el servidor

------------------------------------------------------------------------

## 🛠️ Tecnologías usadas

### Backend

-   Node.js
-   Express
-   Multer
-   dotenv
-   CORS

### Frontend

-   React
-   JSX
-   Fetch API / Axios

------------------------------------------------------------------------

## ⚙️ Instalación y ejecución

### 1. Backend

``` bash
cd backend
npm install
npm start
```

Asegura que tu archivo `.env` tenga:

    PORT=5000
    UPLOAD_PATH=uploads

### 2. Frontend

``` bash
cd sistema-acompanamiento-estudiantil
npm install
npm start
```

------------------------------------------------------------------------

## 📌 Próximas mejoras

-   Autenticación
-   Base de datos activa
-   Mejor diseño de interfaz

------------------------------------------------------------------------

## 📄 Licencia

Proyecto académico. Uso libre para fines educativos.
