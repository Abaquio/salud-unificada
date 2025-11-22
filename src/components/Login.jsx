import React, { useState } from "react";
import styled from "styled-components";
import Loader from "./Loader"; // ajusta la ruta si lo pusiste en otra carpeta

const Login = ({ onEnter }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // aquí podrías hacer lógica real de login (fetch, etc.)
    // Por ahora solo simulamos un pequeño delay para que se vea el loader
    setTimeout(() => {
      if (onEnter) onEnter();
      // no hace falta setIsLoading(false) porque el componente se desmonta
    }, 1200);
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
                <input required type="text" placeholder=" " />
                <label>Usuario</label>
              </div>

              <div className="input-box">
                <input required type="password" placeholder=" " />
                <label>Contraseña</label>
              </div>

              <button className="btn" type="submit" disabled={isLoading}>
                {isLoading ? "Ingresando..." : "Entrar"}
              </button>


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
