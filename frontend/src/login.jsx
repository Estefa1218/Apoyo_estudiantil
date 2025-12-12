import { useState } from "react";
import "./login.css";

function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);


  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");


  const [nameR, setNameR] = useState("");
  const [emailR, setEmailR] = useState("");
  const [passR, setPassR] = useState("");


  const handleLogin = async (e) => {
    e.preventDefault();

    if (!user || !pass) {
      alert("Todos los campos son obligatorios");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user, password: pass }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Credenciales incorrectas");
        return;
      }

      alert("Inicio de sesión exitoso");
      onLogin();

    } catch (error) {
      alert("Error al conectar con el servidor");
      console.error(error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!nameR || !emailR || !passR) {
      alert("Todos los campos son obligatorios");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nameR,
          email: emailR,
          password: passR,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Error al registrar usuario");
        return;
      }

      alert("Usuario registrado con éxito");

      setNameR("");
      setEmailR("");
      setPassR("");
      setIsRegister(false);

    } catch (error) {
      alert("Error en la conexión con el servidor");
      console.error(error);
    }
  };

  return (
    <div className="wrapper">
      {!isRegister && (
        <div className="boxLogin">
          <h2>Iniciar Sesión</h2>

          <form onSubmit={handleLogin}>
            <div className="inputBox">
              <input
                type="text"
                required
                placeholder=" "
                value={user}
                onChange={(e) => setUser(e.target.value)}
              />
              <label>Correo</label>
            </div>

            <div className="inputBox">
              <input
                type="password"
                required
                placeholder=" "
                value={pass}
                onChange={(e) => setPass(e.target.value)}
              />
              <label>Contraseña</label>
            </div>

            <button id="boton">Iniciar sesión</button>

            <div className="registrar">
              <p>
                ¿No tienes cuenta?{" "}
                <a href="#" onClick={() => setIsRegister(true)}>
                  Crear cuenta
                </a>
              </p>
            </div>
          </form>
        </div>
      )}

      {isRegister && (
        <div className="boxLogin">
          <h2>Crear Cuenta</h2>

          <form onSubmit={handleRegister}>
            <div className="inputBox">
              <input
                type="text"
                required
                placeholder=" "
                value={nameR}
                onChange={(e) => setNameR(e.target.value)}
              />
              <label>Nombre</label>
            </div>

            <div className="inputBox">
              <input
                type="email"
                required
                placeholder=" "
                value={emailR}
                onChange={(e) => setEmailR(e.target.value)}
              />
              <label>Correo</label>
            </div>

            <div className="inputBox">
              <input
                type="password"
                required
                placeholder=" "
                value={passR}
                onChange={(e) => setPassR(e.target.value)}
              />
              <label>Contraseña</label>
            </div>

            <button id="boton">Registrar</button>

            <div className="registrar">
              <p>
                ¿Ya tienes cuenta?{" "}
                <a href="#" onClick={() => setIsRegister(false)}>
                  Iniciar sesión
                </a>
              </p>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Login;
