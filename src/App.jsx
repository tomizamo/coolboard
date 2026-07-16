import { useState } from "react";
import SelectAngle from "./components/ColorWheel.jsx";
import HexInput from "./components/HexInput.jsx";
import Wireframe from "./wireframe/Wireframe.jsx";
import {
  hslToHex,
  hslToRgb,
  rgbToHsl,
  normalizeHue,
  contrastText,
  getAnalogous,
  getComplementary,
  getSplitComplementary,
  getTriad,
  getSquare,
  getShades,
  getTints,
  buildExportBlock,
} from "./utils/color.js";
import "./App.css";

export default function App() {

  const [vista, setVista] = useState("colores");

  const [hue1, setHue1] = useState(0);
  const [saturation1, setSaturation1] = useState(100);
  const [lightness1, setLightness1] = useState(50);

  const [hue2, setHue2] = useState(72);
  const [saturation2, setSaturation2] = useState(100);
  const [lightness2, setLightness2] = useState(50);

  const [hue3, setHue3] = useState(144);
  const [saturation3, setSaturation3] = useState(100);
  const [lightness3, setLightness3] = useState(50);

  const [hue4, setHue4] = useState(216);
  const [saturation4, setSaturation4] = useState(100);
  const [lightness4, setLightness4] = useState(50);

  const [hue5, setHue5] = useState(288);
  const [saturation5, setSaturation5] = useState(100);
  const [lightness5, setLightness5] = useState(50);

  const [selectorActivo, setSelectorActivo] = useState(1);
  const [armonia, setArmonia] = useState("ninguna");
  const [mostrarPanelDev, setMostrarPanelDev] = useState(false);

  // Estado solo de la interfaz mobile (los 3 "cajones" del boceto).
  const [formatoActivo, setFormatoActivo] = useState("hsl");
  const [mostrarDropdownArmonia, setMostrarDropdownArmonia] = useState(false);
  const [mostrarDropdownFormato, setMostrarDropdownFormato] = useState(false);
  const [mostrarPopupCode, setMostrarPopupCode] = useState(false);

  // Valores del selector activo (el último que tocaste, por click o arrastre).
  const hueActivo =
      selectorActivo === 1 ? hue1 :
      selectorActivo === 2 ? hue2 :
      selectorActivo === 3 ? hue3 :
      selectorActivo === 4 ? hue4 : hue5;

  const saturationActiva =
      selectorActivo === 1 ? saturation1 :
      selectorActivo === 2 ? saturation2 :
      selectorActivo === 3 ? saturation3 :
      selectorActivo === 4 ? saturation4 : saturation5;

  const lightnessActiva =
      selectorActivo === 1 ? lightness1 :
      selectorActivo === 2 ? lightness2 :
      selectorActivo === 3 ? lightness3 :
      selectorActivo === 4 ? lightness4 : lightness5;

  // Aplica la armonía elegida usando COMO MAESTRO el selector que se movió
  // (indiceMovido, cualquiera de los 5) y reparte el resultado en los otros 4.
  function aplicarArmonia(tipoArmonia, indiceMovido, h, s, l) {
    // Sombras, Tintes y Monocromática no siguen el esquema genérico de abajo:
    // el maestro se queda en su posición real (indiceMovido) y los otros 4
    // dependen de la DISTANCIA de posición a ese maestro, así que se calculan
    // aparte. Monocromática usa la misma fórmula que Sombras (hacia el negro),
    // pero ColorWheel.jsx bloquea el arrastre de los selectores 2 a 5 en ese
    // modo, así que indiceMovido siempre termina siendo 1.
    if (tipoArmonia === "sombras" || tipoArmonia === "tintes" || tipoArmonia === "monocromatica") {
      const resultado =
          tipoArmonia === "tintes"
              ? getTints(h, s, l, indiceMovido)
              : getShades(h, s, l, indiceMovido);

      if (indiceMovido !== 1) { setHue1(resultado[0].h); setSaturation1(resultado[0].s); setLightness1(resultado[0].l); }
      if (indiceMovido !== 2) { setHue2(resultado[1].h); setSaturation2(resultado[1].s); setLightness2(resultado[1].l); }
      if (indiceMovido !== 3) { setHue3(resultado[2].h); setSaturation3(resultado[2].s); setLightness3(resultado[2].l); }
      if (indiceMovido !== 4) { setHue4(resultado[3].h); setSaturation4(resultado[3].s); setLightness4(resultado[3].l); }
      if (indiceMovido !== 5) { setHue5(resultado[4].h); setSaturation5(resultado[4].s); setLightness5(resultado[4].l); }
      return;
    }

    let resultado;
    if (tipoArmonia === "analoga") resultado = getAnalogous(h, s, l);
    else if (tipoArmonia === "complementaria") resultado = getComplementary(h, s, l);
    else if (tipoArmonia === "dividida") resultado = getSplitComplementary(h, s, l);
    else if (tipoArmonia === "triada") resultado = getTriad(h, s, l);
    else if (tipoArmonia === "cuadrada") resultado = getSquare(h, s, l);
    else return;

    if (indiceMovido === 1) {
      setHue2(resultado[0].h); setSaturation2(resultado[0].s); setLightness2(resultado[0].l);
      setHue3(resultado[2].h); setSaturation3(resultado[2].s); setLightness3(resultado[2].l);
      setHue4(resultado[3].h); setSaturation4(resultado[3].s); setLightness4(resultado[3].l);
      setHue5(resultado[4].h); setSaturation5(resultado[4].s); setLightness5(resultado[4].l);
    } else if (indiceMovido === 2) {
      setHue1(resultado[0].h); setSaturation1(resultado[0].s); setLightness1(resultado[0].l);
      setHue3(resultado[2].h); setSaturation3(resultado[2].s); setLightness3(resultado[2].l);
      setHue4(resultado[3].h); setSaturation4(resultado[3].s); setLightness4(resultado[3].l);
      setHue5(resultado[4].h); setSaturation5(resultado[4].s); setLightness5(resultado[4].l);
    } else if (indiceMovido === 3) {
      setHue1(resultado[0].h); setSaturation1(resultado[0].s); setLightness1(resultado[0].l);
      setHue2(resultado[2].h); setSaturation2(resultado[2].s); setLightness2(resultado[2].l);
      setHue4(resultado[3].h); setSaturation4(resultado[3].s); setLightness4(resultado[3].l);
      setHue5(resultado[4].h); setSaturation5(resultado[4].s); setLightness5(resultado[4].l);
    } else if (indiceMovido === 4) {
      setHue1(resultado[0].h); setSaturation1(resultado[0].s); setLightness1(resultado[0].l);
      setHue2(resultado[2].h); setSaturation2(resultado[2].s); setLightness2(resultado[2].l);
      setHue3(resultado[3].h); setSaturation3(resultado[3].s); setLightness3(resultado[3].l);
      setHue5(resultado[4].h); setSaturation5(resultado[4].s); setLightness5(resultado[4].l);
    } else if (indiceMovido === 5) {
      setHue1(resultado[0].h); setSaturation1(resultado[0].s); setLightness1(resultado[0].l);
      setHue2(resultado[2].h); setSaturation2(resultado[2].s); setLightness2(resultado[2].l);
      setHue3(resultado[3].h); setSaturation3(resultado[3].s); setLightness3(resultado[3].l);
      setHue4(resultado[4].h); setSaturation4(resultado[4].s); setLightness4(resultado[4].l);
    }
  }

  // Cada vez que cambiás de armonía (incluido volver a "Libre"), la paleta
  // vuelve a la posición de arranque y el selector 1 pasa a ser el maestro.
  // Así evitamos arrastrar mezclas raras de la armonía anterior (ej: si venís
  // de Monocromática, los 5 quedaban con el mismo hue "pegado").
  function handleArmoniaChange(nuevaArmonia) {
    setArmonia(nuevaArmonia);
    setSelectorActivo(1);

    setHue1(0); setSaturation1(100); setLightness1(50);
    setHue2(72); setSaturation2(100); setLightness2(50);
    setHue3(144); setSaturation3(100); setLightness3(50);
    setHue4(216); setSaturation4(100); setLightness4(50);
    setHue5(288); setSaturation5(100); setLightness5(50);

    if (nuevaArmonia !== "ninguna") {
      aplicarArmonia(nuevaArmonia, 1, 0, 100, 50);
    }
  }

  function moverSelector1(nuevoHue, nuevaSaturacion) {
    setHue1(nuevoHue);
    setSaturation1(nuevaSaturacion);
    setSelectorActivo(1);
    if (armonia !== "ninguna") aplicarArmonia(armonia, 1, nuevoHue, nuevaSaturacion, lightness1);
  }

  function moverSelector2(nuevoHue, nuevaSaturacion) {
    setHue2(nuevoHue);
    setSaturation2(nuevaSaturacion);
    setSelectorActivo(2);
    if (armonia !== "ninguna") aplicarArmonia(armonia, 2, nuevoHue, nuevaSaturacion, lightness2);
  }

  function moverSelector3(nuevoHue, nuevaSaturacion) {
    setHue3(nuevoHue);
    setSaturation3(nuevaSaturacion);
    setSelectorActivo(3);
    if (armonia !== "ninguna") aplicarArmonia(armonia, 3, nuevoHue, nuevaSaturacion, lightness3);
  }

  function moverSelector4(nuevoHue, nuevaSaturacion) {
    setHue4(nuevoHue);
    setSaturation4(nuevaSaturacion);
    setSelectorActivo(4);
    if (armonia !== "ninguna") aplicarArmonia(armonia, 4, nuevoHue, nuevaSaturacion, lightness4);
  }

  function moverSelector5(nuevoHue, nuevaSaturacion) {
    setHue5(nuevoHue);
    setSaturation5(nuevaSaturacion);
    setSelectorActivo(5);
    if (armonia !== "ninguna") aplicarArmonia(armonia, 5, nuevoHue, nuevaSaturacion, lightness5);
  }

  // Punto único para aplicar un color nuevo al selector activo, sea cual sea
  // el campo que lo disparó (H, S, L, hex o RGB). Además cascadea la armonía,
  // igual que hacen los moverSelectorN cuando arrastrás en la rueda.
  function aplicarColorActivo(nuevoHue, nuevaSaturacion, nuevaLuminosidad) {
    if (selectorActivo === 1) { setHue1(nuevoHue); setSaturation1(nuevaSaturacion); setLightness1(nuevaLuminosidad); }
    else if (selectorActivo === 2) { setHue2(nuevoHue); setSaturation2(nuevaSaturacion); setLightness2(nuevaLuminosidad); }
    else if (selectorActivo === 3) { setHue3(nuevoHue); setSaturation3(nuevaSaturacion); setLightness3(nuevaLuminosidad); }
    else if (selectorActivo === 4) { setHue4(nuevoHue); setSaturation4(nuevaSaturacion); setLightness4(nuevaLuminosidad); }
    else { setHue5(nuevoHue); setSaturation5(nuevaSaturacion); setLightness5(nuevaLuminosidad); }

    if (armonia !== "ninguna") {
      aplicarArmonia(armonia, selectorActivo, nuevoHue, nuevaSaturacion, nuevaLuminosidad);
    }
  }

  function moverLightness(nuevoValor) {
    const v = Math.min(100, Math.max(0, nuevoValor));
    aplicarColorActivo(hueActivo, saturationActiva, v);
  }

  function moverHueManual(nuevoValor) {
    aplicarColorActivo(normalizeHue(nuevoValor), saturationActiva, lightnessActiva);
  }

  function moverSaturationManual(nuevoValor) {
    const v = Math.min(100, Math.max(0, nuevoValor));
    aplicarColorActivo(hueActivo, v, lightnessActiva);
  }

  // El campo de texto hex escribe directo sobre el selector activo.
  function aplicarColorManual(hsl) {
    aplicarColorActivo(hsl.h, hsl.s, hsl.l);
  }

  function moverRgbCampo(campo, nuevoValor) {
    const v = Math.min(255, Math.max(0, nuevoValor));
    const actual = hslToRgb(hueActivo, saturationActiva, lightnessActiva);
    const nuevo = { ...actual, [campo]: v };
    const hsl = rgbToHsl(nuevo.r, nuevo.g, nuevo.b);
    aplicarColorActivo(hsl.h, hsl.s, hsl.l);
  }

  function copiar(texto) {
    navigator.clipboard.writeText(texto);
  }

  function nombreArmonia(valor) {
    if (valor === "ninguna") return "Libre";
    if (valor === "analoga") return "Análoga";
    if (valor === "complementaria") return "Complementaria";
    if (valor === "dividida") return "Dividida";
    if (valor === "triada") return "Tríada";
    if (valor === "cuadrada") return "Cuadrada";
    if (valor === "monocromatica") return "Monocromática";
    if (valor === "tintes") return "Tintes";
    return "Sombras";
  }

  function elegirArmoniaMobile(nuevaArmonia) {
    handleArmoniaChange(nuevaArmonia);
    setMostrarDropdownArmonia(false);
  }

  function elegirFormatoMobile(nuevoFormato) {
    setFormatoActivo(nuevoFormato);
    setMostrarDropdownFormato(false);
  }

  const hex1 = hslToHex(hue1, saturation1, lightness1);
  const hex2 = hslToHex(hue2, saturation2, lightness2);
  const hex3 = hslToHex(hue3, saturation3, lightness3);
  const hex4 = hslToHex(hue4, saturation4, lightness4);
  const hex5 = hslToHex(hue5, saturation5, lightness5);

  const hexActivo =
      selectorActivo === 1 ? hex1 :
      selectorActivo === 2 ? hex2 :
      selectorActivo === 3 ? hex3 :
      selectorActivo === 4 ? hex4 : hex5;

  const rgbActivo = hslToRgb(hueActivo, saturationActiva, lightnessActiva);

  const hsl1Texto = `hsl(${hue1}, ${saturation1}%, ${lightness1}%)`;
  const hsl2Texto = `hsl(${hue2}, ${saturation2}%, ${lightness2}%)`;
  const hsl3Texto = `hsl(${hue3}, ${saturation3}%, ${lightness3}%)`;
  const hsl4Texto = `hsl(${hue4}, ${saturation4}%, ${lightness4}%)`;
  const hsl5Texto = `hsl(${hue5}, ${saturation5}%, ${lightness5}%)`;

  const textoExport = buildExportBlock([
    { nombre: "color-1", hex: hex1, h: hue1, s: saturation1, l: lightness1 },
    { nombre: "color-2", hex: hex2, h: hue2, s: saturation2, l: lightness2 },
    { nombre: "color-3", hex: hex3, h: hue3, s: saturation3, l: lightness3 },
    { nombre: "color-4", hex: hex4, h: hue4, s: saturation4, l: lightness4 },
    { nombre: "color-5", hex: hex5, h: hue5, s: saturation5, l: lightness5 },
  ]);

  return (
      <div className="bg">

        <nav className="navbar">
          <span className="navbar-logo">coolboard</span>
          <div className="navbar-tabs">
            <button
                className={vista === "colores" ? "navbar-tab activa" : "navbar-tab"}
                onClick={() => setVista("colores")}
            >
              Paleta de colores
            </button>
            <button
                className={vista === "wireframe" ? "navbar-tab activa" : "navbar-tab"}
                onClick={() => setVista("wireframe")}
            >
              Bosquejador
            </button>
          </div>
        </nav>

        {vista === "wireframe" && <Wireframe />}

        {vista === "colores" && (
        <div className="layout">

          <div className="grilla">
            <div className="rectangulo" style={{ background: `hsl(${hue1},${saturation1}%,${lightness1}%)` }}>
              <span className="rectangulo-hex" style={{ color: contrastText(lightness1) }}>#{hex1}</span>
              <button className="rectangulo-hsl" style={{ color: contrastText(lightness1) }} onClick={() => copiar(hsl1Texto)}>
                {hsl1Texto}
              </button>
            </div>
            <div className="rectangulo" style={{ background: `hsl(${hue2},${saturation2}%,${lightness2}%)` }}>
              <span className="rectangulo-hex" style={{ color: contrastText(lightness2) }}>#{hex2}</span>
              <button className="rectangulo-hsl" style={{ color: contrastText(lightness2) }} onClick={() => copiar(hsl2Texto)}>
                {hsl2Texto}
              </button>
            </div>
            <div className="rectangulo" style={{ background: `hsl(${hue3},${saturation3}%,${lightness3}%)` }}>
              <span className="rectangulo-hex" style={{ color: contrastText(lightness3) }}>#{hex3}</span>
              <button className="rectangulo-hsl" style={{ color: contrastText(lightness3) }} onClick={() => copiar(hsl3Texto)}>
                {hsl3Texto}
              </button>
            </div>
            <div className="rectangulo" style={{ background: `hsl(${hue4},${saturation4}%,${lightness4}%)` }}>
              <span className="rectangulo-hex" style={{ color: contrastText(lightness4) }}>#{hex4}</span>
              <button className="rectangulo-hsl" style={{ color: contrastText(lightness4) }} onClick={() => copiar(hsl4Texto)}>
                {hsl4Texto}
              </button>
            </div>
            <div className="rectangulo" style={{ background: `hsl(${hue5},${saturation5}%,${lightness5}%)` }}>
              <span className="rectangulo-hex" style={{ color: contrastText(lightness5) }}>#{hex5}</span>
              <button className="rectangulo-hsl" style={{ color: contrastText(lightness5) }} onClick={() => copiar(hsl5Texto)}>
                {hsl5Texto}
              </button>
            </div>
          </div>

          <div className="panel-derecho">

            <div className="wheel-wrapper">
              <SelectAngle
                  hue1={hue1} saturation1={saturation1} lightness1={lightness1} onMoverSelector1={moverSelector1}
                  hue2={hue2} saturation2={saturation2} lightness2={lightness2} onMoverSelector2={moverSelector2}
                  hue3={hue3} saturation3={saturation3} lightness3={lightness3} onMoverSelector3={moverSelector3}
                  hue4={hue4} saturation4={saturation4} lightness4={lightness4} onMoverSelector4={moverSelector4}
                  hue5={hue5} saturation5={saturation5} lightness5={lightness5} onMoverSelector5={moverSelector5}
                  lightnessActiva={lightnessActiva}
                  onLightnessChange={moverLightness}
                  armonia={armonia}
                  onArmoniaChange={handleArmoniaChange}
              />
            </div>

            <div className="color-manual solo-desktop">
              <div className="panel-header">
                <span>Color {selectorActivo}</span>
              </div>

              <div className="color-manual-caja">
                <div className="campo-fila">
                  <span className="campo-etiqueta">HSL</span>
                  <input className="campo-numero" type="number" min={0} max={360} value={hueActivo} onChange={(e) => moverHueManual(Number(e.target.value))} />
                  <input className="campo-numero" type="number" min={0} max={100} value={saturationActiva} onChange={(e) => moverSaturationManual(Number(e.target.value))} />
                  <input className="campo-numero" type="number" min={0} max={100} value={lightnessActiva} onChange={(e) => moverLightness(Number(e.target.value))} />
                </div>

                <div className="campo-fila">
                  <span className="campo-etiqueta">HEX</span>
                  <HexInput
                      key={`${selectorActivo}-${hueActivo}-${saturationActiva}-${lightnessActiva}`}
                      valorInicial={`#${hexActivo}`}
                      onAplicar={aplicarColorManual}
                  />
                </div>

                <div className="campo-fila">
                  <span className="campo-etiqueta">RGB</span>
                  <input className="campo-numero" type="number" min={0} max={255} value={rgbActivo.r} onChange={(e) => moverRgbCampo("r", Number(e.target.value))} />
                  <input className="campo-numero" type="number" min={0} max={255} value={rgbActivo.g} onChange={(e) => moverRgbCampo("g", Number(e.target.value))} />
                  <input className="campo-numero" type="number" min={0} max={255} value={rgbActivo.b} onChange={(e) => moverRgbCampo("b", Number(e.target.value))} />
                </div>
              </div>
            </div>

            <div className="panel-dev solo-desktop">
              <button className="panel-dev-header" onClick={() => setMostrarPanelDev(!mostrarPanelDev)}>
                <span className="panel-dev-icono">{"</>"}</span>
                <span className="panel-dev-nombre">Code</span>
                <span className="panel-dev-flecha">{mostrarPanelDev ? "▾" : "▸"}</span>
              </button>

              {mostrarPanelDev && (
                  <>
                    <pre className="panel-dev-codigo">{textoExport}</pre>
                    <button className="boton-copiar-todo" onClick={() => copiar(textoExport)}>Copiar todo</button>
                  </>
              )}
            </div>

            {/* Solo mobile: 3 cajones (armonía, color, code) en vez de las
                secciones de escritorio de arriba — colapsan en dropdowns/popup
                para que entren en una pantalla chica. */}
            <div className="mobile-controles solo-mobile">

              <div className="mobile-dropdown">
                <button className="mobile-barra" onClick={() => setMostrarDropdownArmonia(!mostrarDropdownArmonia)}>
                  <span>{nombreArmonia(armonia)}</span>
                  <span>▾</span>
                </button>
                {mostrarDropdownArmonia && (
                    <div className="mobile-dropdown-lista">
                      <button onClick={() => elegirArmoniaMobile("ninguna")}>Libre</button>
                      <button onClick={() => elegirArmoniaMobile("analoga")}>Análoga</button>
                      <button onClick={() => elegirArmoniaMobile("complementaria")}>Complementaria</button>
                      <button onClick={() => elegirArmoniaMobile("dividida")}>Dividida</button>
                      <button onClick={() => elegirArmoniaMobile("triada")}>Tríada</button>
                      <button onClick={() => elegirArmoniaMobile("cuadrada")}>Cuadrada</button>
                      <button onClick={() => elegirArmoniaMobile("monocromatica")}>Monocromática</button>
                      <button onClick={() => elegirArmoniaMobile("sombras")}>Sombras</button>
                      <button onClick={() => elegirArmoniaMobile("tintes")}>Tintes</button>
                    </div>
                )}
              </div>

              <div className="mobile-dropdown">
                <button className="mobile-barra" onClick={() => setMostrarDropdownFormato(!mostrarDropdownFormato)}>
                  <span>{formatoActivo.toUpperCase()}</span>
                  <span>▾</span>
                </button>
                {mostrarDropdownFormato && (
                    <div className="mobile-dropdown-lista">
                      <button onClick={() => elegirFormatoMobile("hsl")}>HSL</button>
                      <button onClick={() => elegirFormatoMobile("hex")}>HEX</button>
                      <button onClick={() => elegirFormatoMobile("rgb")}>RGB</button>
                    </div>
                )}

                {formatoActivo === "hsl" && (
                    <div className="campo-fila mobile-campo-fila">
                      <input className="campo-numero" type="number" min={0} max={360} value={hueActivo} onChange={(e) => moverHueManual(Number(e.target.value))} />
                      <input className="campo-numero" type="number" min={0} max={100} value={saturationActiva} onChange={(e) => moverSaturationManual(Number(e.target.value))} />
                      <input className="campo-numero" type="number" min={0} max={100} value={lightnessActiva} onChange={(e) => moverLightness(Number(e.target.value))} />
                    </div>
                )}

                {formatoActivo === "hex" && (
                    <div className="mobile-campo-fila">
                      <HexInput
                          key={`${selectorActivo}-${hueActivo}-${saturationActiva}-${lightnessActiva}`}
                          valorInicial={`#${hexActivo}`}
                          onAplicar={aplicarColorManual}
                      />
                    </div>
                )}

                {formatoActivo === "rgb" && (
                    <div className="campo-fila mobile-campo-fila">
                      <input className="campo-numero" type="number" min={0} max={255} value={rgbActivo.r} onChange={(e) => moverRgbCampo("r", Number(e.target.value))} />
                      <input className="campo-numero" type="number" min={0} max={255} value={rgbActivo.g} onChange={(e) => moverRgbCampo("g", Number(e.target.value))} />
                      <input className="campo-numero" type="number" min={0} max={255} value={rgbActivo.b} onChange={(e) => moverRgbCampo("b", Number(e.target.value))} />
                    </div>
                )}
              </div>

              <button className="mobile-barra mobile-barra-code" onClick={() => setMostrarPopupCode(true)}>
                <span className="panel-dev-icono">{"</>"}</span>
                <span>Copy Code</span>
              </button>
            </div>

          </div>

        </div>
        )}

        {mostrarPopupCode && (
            <div className="popup-overlay" onClick={() => setMostrarPopupCode(false)}>
              <div className="popup-caja" onClick={(e) => e.stopPropagation()}>
                <div className="popup-header">
                  <span>{"</>"} Code</span>
                  <button onClick={() => setMostrarPopupCode(false)}>✕</button>
                </div>
                <pre className="panel-dev-codigo">{textoExport}</pre>
                <button className="boton-copiar-todo" onClick={() => copiar(textoExport)}>Copiar todo</button>
              </div>
            </div>
        )}
      </div>
  );
}
