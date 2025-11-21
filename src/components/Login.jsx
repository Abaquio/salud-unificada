import React from "react";
import styled from "styled-components";

const Login = ({ onEnter }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onEnter(); // Cambia el estado en App.jsx
  };

  return (
    <StyledWrapper>
      <div className="login-container">
        <form className="login-card" onSubmit={handleSubmit}>
          <div className="login-title">
            <span className="login-text">Login</span>
          </div>

          <div className="login-form">
            <div className="input-group">
              <input
                required
                placeholder="Usuario"
                className="login-input"
                type="text"
              />
            </div>

            <div className="input-group">
              <input
                required
                placeholder="Contraseña"
                className="login-input"
                type="password"
              />
            </div>

            <button className="login-btn" type="submit">
              Entrar
            </button>
          </div>
        </form>
      </div>
    </StyledWrapper>
  );
};

// ------------ ESTILOS ------------
const StyledWrapper = styled.div`
  .login-container {
    position: relative;
    perspective: 1000px;
    width: 220px;
    margin: 0 auto;
    margin-top: 150px;
  }

  .login-card {
    position: relative;
    width: 100%;
    height: 80px;
    background: linear-gradient(135deg, #ff3366, #ff6b35);
    border: 4px solid #000;
    box-shadow: 8px 8px 0 #000, 16px 16px 0 rgba(255, 51, 102, 0.3);
    cursor: pointer;
    overflow: hidden;
    transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    transform-style: preserve-3d;
  }

  .login-card:hover {
    height: 240px;
    transform: translateZ(20px) rotateX(5deg) rotateY(-5deg);
    box-shadow: 12px 12px 0 #000, 24px 24px 0 rgba(255, 51, 102, 0.4),
      0 0 50px rgba(255, 51, 102, 0.6);
  }

  .login-title {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: inherit;
    transition: all 0.4s ease;
  }

  .login-text {
    color: #000;
    font-weight: 800;
    font-size: 16px;
    text-transform: uppercase;
    letter-spacing: 2px;
    text-shadow: 2px 2px 0 rgba(255, 255, 255, 0.3);
    transition: all 0.4s ease;
  }

  .login-card:hover .login-text {
    opacity: 0;
    transform: translateY(-30px) scale(0.8);
  }

  .login-form {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    opacity: 0;
    transform: translateY(30px) scale(0.8);
    transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .login-card:hover .login-form {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  .input-group {
    width: 100%;
    margin-bottom: 20px;
  }

  .login-input {
    width: 100%;
    padding: 12px 10px;
    background: rgba(255, 255, 255, 0.8);
    border: 3px solid #000;
    font-weight: 700;
    color: #000;
    box-shadow: 4px 4px 0 #000;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .login-input:focus {
    outline: none;
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0 #000;
  }

  .login-btn {
    width: 100%;
    padding: 12px;
    background: #000;
    color: #fff;
    border: none;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    cursor: pointer;
    box-shadow: 4px 4px 0 rgba(255, 255, 255, 0.3);
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .login-btn:hover {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0 rgba(255, 255, 255, 0.3);
    background: #333;
  }
`;

export default Login;