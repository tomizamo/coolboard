import { useState } from "react";
import "./Selector.css";

export default function Selector({ ruedaRef, hue, saturation, lightness, onMove, bloqueado = false }) {

  // Estado LOCAL, solo de este selector puntual: ¿me están arrastrando ahora mismo?
  const [arrastrando, setArrastrando] = useState(false);

  function calcularAngulo(e) {
    // ruedaRef.current es el <div className="color-wheel"> real del DOM (nos lo pasó ColorWheel).
    // getBoundingClientRect() es un método nativo del navegador (no lo escribimos nosotros):
    // pregunta "¿dónde estás parado y qué tamaño tenés, AHORA MISMO, en la pantalla?"
    // Devuelve { top, left, width, height, ... } de LA RUEDA, no de este selector.
    const medidas = ruedaRef.current.getBoundingClientRect();

    const radio = medidas.width / 2;
    const centroX = medidas.left + radio;
    const centroY = medidas.top + radio;

    // e.clientX/Y = dónde está el mouse/dedo ahora. dx/dy = distancia al centro de la rueda.
    const dx = e.clientX - centroX;
    const dy = e.clientY - centroY;

    // ángulo (hue): de qué lado del centro estoy.
    let grados = Math.atan2(dy, dx) * (180 / Math.PI);
    if (grados < 0) grados += 360;

    // distancia al CENTRO (no al "interior"): 0 = justo en el centro (gris, sin saturar),
    // radio completo = borde de la rueda (saturación 100%, color puro).
    const distancia = Math.sqrt(dx * dx + dy * dy);
    const nuevaSaturacion = Math.min(100, Math.round((distancia / radio) * 100));

    // Le avisamos al padre (App, vía el prop onMove) los 2 números calculados.
    // Este componente NO los guarda — solo calcula y avisa.
    onMove(Math.round(grados), nuevaSaturacion);
  }

  function handlePointerDown(e) {
    if (bloqueado) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setArrastrando(true);
    calcularAngulo(e);
  }

  function handlePointerMove(e) {
    if (!arrastrando) return;
    calcularAngulo(e);
  }

  function handlePointerUp() {
    setArrastrando(false);
  }

  // Esto es el camino INVERSO al de calcularAngulo: en vez de "click -> hue/saturación",
  // acá vamos "hue/saturación (que ya tenemos guardados) -> posición en pantalla (%)".
  // No usa ruedaRef para nada: es matemática pura a partir de los props hue/saturation.
  const anguloRad = hue * (Math.PI / 180);
  const distanciaPorcentaje = (saturation / 100) * 50;
  const left = 50 + distanciaPorcentaje * Math.cos(anguloRad);
  const top = 50 + distanciaPorcentaje * Math.sin(anguloRad);

  return (
      <>
        {arrastrando && (
            <div
                className="color-wheel-linea"
                style={{
                  width: `${distanciaPorcentaje}%`,
                  transform: `rotate(${hue}deg)`,
                }}
            />
        )}

        <div
            className={bloqueado ? "color-wheel-marcador bloqueado" : "color-wheel-marcador"}
            style={{
              left: `${left}%`,
              top: `${top}%`,
              background: `hsl(${hue},${saturation}%,${lightness}%)`,
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onLostPointerCapture={handlePointerUp}
        />
      </>
  );
}
