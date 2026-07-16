import { useRef } from "react";
import Selector from "./Selector.jsx";
import "./ColorWheel.css";

export default function SelectAngle({
  hue1, saturation1, lightness1, onMoverSelector1,
  hue2, saturation2, lightness2, onMoverSelector2,
  hue3, saturation3, lightness3, onMoverSelector3,
  hue4, saturation4, lightness4, onMoverSelector4,
  hue5, saturation5, lightness5, onMoverSelector5,
  lightnessActiva, onLightnessChange,
  armonia, onArmoniaChange,
}) {

  const ruedaRef = useRef(null);

  const colorVelo = lightnessActiva >= 50 ? "white" : "black";
  const opacidadVelo = Math.abs(lightnessActiva - 50) / 50;

  return (
      <div className="wheel-column">
        <div className="color-wheel" ref={ruedaRef}>
          <div
              className="color-wheel-velo"
              style={{ background: colorVelo, opacity: opacidadVelo }}
          />

          <Selector ruedaRef={ruedaRef} hue={hue1} saturation={saturation1} lightness={lightness1} onMove={onMoverSelector1} />
          <Selector ruedaRef={ruedaRef} hue={hue2} saturation={saturation2} lightness={lightness2} onMove={onMoverSelector2} bloqueado={armonia === "monocromatica"} />
          <Selector ruedaRef={ruedaRef} hue={hue3} saturation={saturation3} lightness={lightness3} onMove={onMoverSelector3} bloqueado={armonia === "monocromatica"} />
          <Selector ruedaRef={ruedaRef} hue={hue4} saturation={saturation4} lightness={lightness4} onMove={onMoverSelector4} bloqueado={armonia === "monocromatica"} />
          <Selector ruedaRef={ruedaRef} hue={hue5} saturation={saturation5} lightness={lightness5} onMove={onMoverSelector5} bloqueado={armonia === "monocromatica"} />
        </div>

        <input
            className="lightness-slider"
            type="range"
            min={0}
            max={100}
            value={lightnessActiva}
            onChange={(e) => onLightnessChange(Number(e.target.value))}
        />

        <div className="armonia-row">
          <button className={armonia === "ninguna" ? "armonia-boton activo" : "armonia-boton"} onClick={() => onArmoniaChange("ninguna")}>Libre</button>
          <button className={armonia === "analoga" ? "armonia-boton activo" : "armonia-boton"} onClick={() => onArmoniaChange("analoga")}>Análoga</button>
          <button className={armonia === "complementaria" ? "armonia-boton activo" : "armonia-boton"} onClick={() => onArmoniaChange("complementaria")}>Complementaria</button>
          <button className={armonia === "dividida" ? "armonia-boton activo" : "armonia-boton"} onClick={() => onArmoniaChange("dividida")}>Dividida</button>
          <button className={armonia === "triada" ? "armonia-boton activo" : "armonia-boton"} onClick={() => onArmoniaChange("triada")}>Tríada</button>
          <button className={armonia === "cuadrada" ? "armonia-boton activo" : "armonia-boton"} onClick={() => onArmoniaChange("cuadrada")}>Cuadrada</button>
          <button className={armonia === "monocromatica" ? "armonia-boton activo" : "armonia-boton"} onClick={() => onArmoniaChange("monocromatica")}>Monocromática</button>
          <button className={armonia === "sombras" ? "armonia-boton activo" : "armonia-boton"} onClick={() => onArmoniaChange("sombras")}>Sombras</button>
          <button className={armonia === "tintes" ? "armonia-boton activo" : "armonia-boton"} onClick={() => onArmoniaChange("tintes")}>Tintes</button>
        </div>
      </div>
  );
}
