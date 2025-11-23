import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";

const overlayFadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const overlayFadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const cardIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const cardOut = keyframes`
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(12px) scale(0.96);
  }
`;

const StyledWrapper = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
  background: rgba(15, 23, 42, 0.55);
  animation: ${(props) => (props.$isClosing ? overlayFadeOut : overlayFadeIn)}
    0.18s ease-out forwards;

  .card {
    width: 320px;
    max-width: 90vw;
    background: #ffffff;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 26px 24px 20px;
    position: relative;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.25);
    animation: ${(props) => (props.$isClosing ? cardOut : cardIn)}
      0.2s ease-out forwards;
  }

  .card-content {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .card-heading {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
  }

  .card-description {
    font-size: 14px;
    font-weight: 400;
    color: #64748b;
  }

  .card-button-wrapper {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 4px;
  }

  .card-button {
    min-width: 96px;
    height: 36px;
    border-radius: 999px;
    border: none;
    cursor: pointer;
    font-weight: 600;
    font-size: 13px;
    padding: 0 16px;
    transition: transform 0.12s ease, box-shadow 0.12s ease,
      background-color 0.12s ease, color 0.12s ease;
  }

  .card-button:active {
    transform: scale(0.97);
  }

  .secondary {
    background-color: #e2e8f0;
    color: #0f172a;
  }

  .secondary:hover {
    background-color: #cbd5f5;
  }

  .primary {
    background: linear-gradient(135deg, #ef4444, #b91c1c);
    color: #ffffff;
    box-shadow: 0 8px 18px rgba(248, 113, 113, 0.35);
  }

  .primary:hover {
    background: linear-gradient(135deg, #dc2626, #991b1b);
  }

  .exit-button {
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background-color: transparent;
    position: absolute;
    top: 14px;
    right: 14px;
    cursor: pointer;
    padding: 4px;
    border-radius: 999px;
    transition: background-color 0.12s ease;
  }

  .exit-button svg {
    width: 18px;
    height: 18px;
    fill: #94a3b8;
    transition: fill 0.12s ease;
  }

  .exit-button:hover {
    background-color: rgba(148, 163, 184, 0.12);
  }

  .exit-button:hover svg {
    fill: #0f172a;
  }
`;

const ConfirmLogout = ({ onConfirm, onCancel }) => {
  const [isClosing, setIsClosing] = useState(false);

  const startClose = (cb) => {
    setIsClosing(true);
    setTimeout(() => {
      cb?.();
    }, 180); // que coincida con la animación
  };

  const handleCancel = () => startClose(onCancel);
  const handleConfirm = () => startClose(onConfirm);

  // Cerrar con ESC
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        handleCancel();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StyledWrapper
      $isClosing={isClosing}
      onClick={handleCancel} // cerrar si clic en fondo
    >
      <div
        className="card"
        onClick={(e) => e.stopPropagation()} // no cerrar si clic en la tarjeta
      >
        <div className="card-content">
          <p className="card-heading">¿Cerrar sesión?</p>
          <p className="card-description">
            ¿Estás seguro de que deseas cerrar sesión de Salud Unificada?
            Podrás volver a ingresar con tus credenciales cuando lo necesites.
          </p>
        </div>

        <div className="card-button-wrapper">
          <button className="card-button secondary" onClick={handleCancel}>
            Cancelar
          </button>
          <button className="card-button primary" onClick={handleConfirm}>
            Cerrar sesión
          </button>
        </div>

        <button className="exit-button" onClick={handleCancel}>
          <svg height="20px" viewBox="0 0 384 512">
            <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
          </svg>
        </button>
      </div>
    </StyledWrapper>
  );
};

export default ConfirmLogout;
