import { useState } from "react";
import { hexToHsl } from "../utils/color.js";
import "./HexInput.css";

export default function HexInput({ valorInicial, onAplicar }) {

  const [texto, setTexto] = useState(valorInicial);

  function manejarCambio(e) {
    const nuevoTexto = e.target.value;
    setTexto(nuevoTexto);

    const hsl = hexToHsl(nuevoTexto);
    if (hsl) onAplicar(hsl);
  }

  return (
      <input
          className="campo-hex"
          type="text"
          value={texto}
          onChange={manejarCambio}
          maxLength={7}
          spellCheck={false}
      />
  );
}
