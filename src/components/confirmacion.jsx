import React, { useEffect, useState } from "react";
import styled from "styled-components";

const Confirmacion = ({
  title = "Acción realizada",
  message = "Los cambios se guardaron correctamente.",
  onClose,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Activar animación de entrada
    setVisible(true);

    // Auto-cierre después de 2.5 segundos
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 350); // Espera animación salida
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <StyledWrapper>
      <div className={`card ${visible ? "enter" : "exit"}`}>
        <button className="dismiss" type="button" onClick={onClose}>
          ×
        </button>

        <div className="header">
          <div className="div_image_v">
            <div className="image">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 7L9.00004 18L3.99994 13"
                  stroke="#000000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <div className="content">
            <span className="title">{title}</span>
            <p className="message">{message}</p>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  /* ANIMACIONES */
  .card {
    overflow: hidden;
    position: relative;
    border-radius: 0.5rem;
    max-width: 590px;
    background: #fff;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04);
    opacity: 0;
    transform: translateY(30px) scale(0.95);
    transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  }

  /* ENTRADA: más marcada, suave y moderna */
  .enter {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  /* SALIDA */
  .exit {
    opacity: 0;
    transform: translateY(15px) scale(0.98);
  }

  /* ESTILOS DE CONTENIDO */
  .div_image_v {
    background: #47c9a2;
    padding: 35px;
    margin: -20px -20px 0;
    border-radius: 5px 5px 0 0;
  }

  /* Botón X */
  .dismiss {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 28px;
    height: 28px;
    background: transparent;
    border: none;
    font-size: 20px;
    font-weight: bold;
    color: #444;
    cursor: pointer;
    transition: 0.2s ease;
  }

  .dismiss:hover {
    color: #e63946;
    transform: scale(1.15);
  }

  .header {
    padding: 1.25rem 1rem 1rem 1rem;
  }

  .image {
    margin: 0 auto;
    background: #e2feee;
    width: 3rem;
    height: 3rem;
    border-radius: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: pulse 0.6s linear alternate-reverse infinite;
  }

  .image svg {
    width: 2rem;
    height: 2rem;
  }

  @keyframes pulse {
    from {
      transform: scale(1);
    }
    to {
      transform: scale(1.08);
    }
  }

  .content {
    text-align: center;
    margin-top: 0.75rem;
  }

  .title {
    font-size: 1rem;
    font-weight: 600;
    color: #066e29;
  }

  .message {
    margin-top: 0.5rem;
    color: #595b5f;
    font-size: 0.875rem;
  }
`;

export default Confirmacion;
