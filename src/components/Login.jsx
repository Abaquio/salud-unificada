import React, { useState } from "react";
import styled from "styled-components";
import Loader from "./Loader"; // ajusta la ruta si lo tienes en otra carpeta

const API_URL = import.meta.env.VITE_API_URL;

// Iconos simples tipo "ojo" (no emojis)
const EyeIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.77 21.77 0 0 1 5.06-5.94" />
    <path d="M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-.88" />
    <path d="M1 1l22 22" />
  </svg>
);

const Login = ({ onEnter }) => {
  const [rut, setRut] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Auto-formato RUT: 11222333-4
  const handleRutChange = (e) => {
    let value = e.target.value;

    // Eliminar puntos, espacios, guiones y todo lo que no sea dígito o K
    value = value.replace(/[^0-9kK]/g, "");

    // Máximo 9 caracteres: 8 dígitos + DV
    if (value.length > 9) {
      value = value.slice(0, 9);
    }

    if (value.length === 0) {
      setRut("");
      return;
    }

    if (value.length === 1) {
      // Aún no ponemos guion, solo el primer dígito
      setRut(value);
      return;
    }

    const body = value.slice(0, value.length - 1);
    const dv = value.slice(-1).toUpperCase();

    const formatted = `${body}-${dv}`;
    setRut(formatted);
  };

  const isValidRutFormat = (value) => {
    // 7 u 8 dígitos + guion + dígito o K
    const rutRegex = /^\d{7,8}-[\dK]$/;
    return rutRegex.test(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedRut = rut.trim();
    const trimmedPassword = password.trim();

    if (!trimmedRut || !trimmedPassword) {
      setErrorMessage("Usuario y contraseña son obligatorios");
      return;
    }

    if (!isValidRutFormat(trimmedRut)) {
      setErrorMessage(
        "Ingresa un RUT válido en formato 11222333-4 (sin puntos)"
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rutOrEmail: trimmedRut, // el backend acepta RUT o correo aquí
          password: trimmedPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setErrorMessage(data.message || "Usuario o contraseña incorrectos");
        setIsLoading(false);
        return;
      }

      if (onEnter) {
        onEnter(data.user);
      }
    } catch (err) {
      console.error("Error en login:", err);
      setErrorMessage("Error conectando con el servidor");
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <Loader />}

      <StyledWrapper>
        <div className="container">
          <div className="login-box">
            <h2>ACCESO</h2>

            <form onSubmit={handleSubmit}>
              <div className="input-box">
                <input
                  required
                  type="text"
                  placeholder=" "
                  value={rut}
                  onChange={handleRutChange}
                  autoComplete="username"
                />
                <label>RUT (sin puntos, con guion)</label>
              </div>

              <div className="input-box password-box">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder=" "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <label>Contraseña</label>
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              <button className="btn" type="submit" disabled={isLoading}>
                {isLoading ? "Ingresando..." : "Entrar"}
              </button>

              {errorMessage && <p className="error-text">{errorMessage}</p>}
            </form>
          </div>

          {Array.from({ length: 50 }).map((_, i) => (
            <span key={i} style={{ "--i": i }} />
          ))}
        </div>
      </StyledWrapper>
    </>
  );
};

const StyledWrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  background: radial-gradient(circle at top, #0f172a 0, #020617 50%, #000 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  padding: 20px;

  .container {
    position: relative;
    width: 400px;
    height: 400px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    overflow: hidden;
    background: #0b1120;
    box-shadow: 0 0 40px rgba(15, 23, 42, 0.8);
  }

  .container span {
    position: absolute;
    left: 0;
    width: 32px;
    height: 6px;
    background: #1f2937;
    border-radius: 80px;
    transform-origin: 200px;
    transform: rotate(calc(var(--i) * (360deg / 50)));
    animation: blink 2.8s linear infinite;
    animation-delay: calc(var(--i) * (3s / 50));
  }

  @keyframes blink {
    0% {
      background: #0ef;
    }
    25% {
      background: #1f2937;
    }
  }

  @media (max-width: 480px) {
    .container {
      width: 300px;
      height: 300px;
    }
    .container span {
      transform-origin: 150px;
    }
  }

  .login-box {
    position: absolute;
    width: 78%;
    max-width: 260px;
    z-index: 1;
    padding: 24px 20px 20px;
    border-radius: 18px;
    background: rgba(15, 23, 42, 0.92);
    border: 1px solid rgba(148, 163, 184, 0.3);
    backdrop-filter: blur(6px);
  }

  h2 {
    font-size: 1.6em;
    color: #0ef;
    text-align: center;
    margin-bottom: 14px;
    letter-spacing: 0.1em;
  }

  .input-box {
    position: relative;
    margin: 18px 0;
  }

  input {
    width: 100%;
    height: 45px;
    background: transparent;
    border: 2px solid #1f2937;
    border-radius: 40px;
    padding: 0 15px;
    color: #e5e7eb;
    font-size: 0.95em;
    transition: 0.3s ease;
  }

  input::placeholder {
    color: transparent;
  }

  input:focus {
    border-color: #0ef;
    box-shadow: 0 0 10px rgba(34, 211, 238, 0.35);
  }

  input:focus ~ label,
  input:not(:placeholder-shown) ~ label {
    top: -10px;
    font-size: 0.75em;
    padding: 0 6px;
    color: #0ef;
    background: #0b1120;
  }

  label {
    position: absolute;
    top: 50%;
    left: 15px;
    transform: translateY(-50%);
    color: #9ca3af;
    font-size: 0.85em;
    pointer-events: none;
    transition: 0.3s ease;
  }

  .password-box input {
    padding-right: 42px; /* espacio para el ojito */
  }

  .toggle-password {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9ca3af;
  }

  .toggle-password:hover {
    color: #e5e7eb;
  }

  .btn {
    width: 100%;
    height: 45px;
    background: #0ef;
    border-radius: 40px;
    cursor: pointer;
    margin-top: 10px;
    font-size: 0.95em;
    color: #020617;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    transition: 0.3s ease;
    border: none;
  }

  .btn:disabled {
    opacity: 0.7;
    cursor: default;
  }

  .btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 0 20px rgba(34, 211, 238, 0.6);
  }

  .error-text {
    margin-top: 10px;
    font-size: 0.8rem;
    color: #f97373;
    text-align: center;
  }

  .signup-link {
    margin-top: 12px;
    text-align: center;
  }

  .signup-link span {
    font-size: 0.75em;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
`;

export default Login;
