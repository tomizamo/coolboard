export function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;

  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x) => Math.round(x * 255).toString(16).padStart(2, "0");

  return `${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`.toUpperCase();
}

export function contrastText(lightness) {
  return lightness > 60 ? "#111111" : "#ffffff";
}

/**
 * Normaliza cualquier ángulo al rango [0, 360).
 * Necesario porque en JS, -30 % 360 da -30 (negativo), y en la rueda
 * los ángulos siempre tienen que quedar entre 0 y 360.
 */
export function normalizeHue(h) {
  return ((h % 360) + 360) % 360;
}

// Cada función de armonía recibe el color maestro (h, s, l) y devuelve
// un array de 5 objetos {h, s, l} — la posición [1] siempre es el maestro sin tocar.

export function getAnalogous(h, s, l) {
  return [
    { h: normalizeHue(h - 60), s, l },
    { h, s, l },
    { h: normalizeHue(h - 30), s, l },
    { h: normalizeHue(h + 30), s, l },
    { h: normalizeHue(h + 60), s, l },
  ];
}

export function getComplementary(h, s, l) {
  const complementario = normalizeHue(h + 180);
  const masClaro = Math.min(l + 25, 95);
  const masOscuro = Math.max(l - 25, 5);
  return [
    { h, s, l: masOscuro },
    { h, s, l },
    { h: complementario, s, l: masOscuro },
    { h: complementario, s, l },
    { h: complementario, s, l: masClaro },
  ];
}

export function getSplitComplementary(h, s, l) {
  const split1 = normalizeHue(h + 150);
  const split2 = normalizeHue(h + 210);
  return [
    { h, s, l: Math.max(l - 20, 10) },
    { h, s, l },
    { h: split1, s, l },
    { h: split2, s, l },
    { h: split1, s, l: Math.min(l + 20, 90) },
  ];
}

export function getTriad(h, s, l) {
  const p2 = normalizeHue(h + 120);
  const p3 = normalizeHue(h + 240);
  return [
    { h, s, l: Math.max(l - 20, 15) },
    { h, s, l },
    { h: p2, s, l },
    { h: p3, s, l },
    { h: p2, s, l: Math.min(l + 20, 85) },
  ];
}

export function getSquare(h, s, l) {
  return [
    { h: normalizeHue(h + 90), s, l },
    { h, s, l },
    { h: normalizeHue(h + 180), s, l },
    { h: normalizeHue(h + 270), s, l },
    { h, s, l: Math.max(l - 35, 5) },
  ];
}

// Sombras: el maestro se queda en su posición (posicionMaestro, de 1 a 5) y
// los otros 4 se oscurecen hacia el negro según qué tan lejos están de él.
// El oscurecimiento es proporcional al espacio real disponible (l - piso),
// no un número fijo, así nunca chocan dos colores en el mismo piso.
// Devuelve un array indexado directo por posición: resultado[0] = Color 1, ..., resultado[4] = Color 5.
// Monocromática usa esta misma función con posicionMaestro fijo en 1 (App.jsx
// bloquea el arrastre de los selectores 2 a 5 en ese modo).
export function getShades(h, s, l, posicionMaestro) {
  const piso = 5;
  const espacio = Math.max(l - piso, 0);
  const distanciaMaxima = Math.max(posicionMaestro - 1, 5 - posicionMaestro);
  const paso = distanciaMaxima > 0 ? espacio / distanciaMaxima : 0;

  const resultado = [];
  for (let posicion = 1; posicion <= 5; posicion++) {
    if (posicion === posicionMaestro) {
      resultado.push({ h, s, l });
    } else {
      const distancia = Math.abs(posicion - posicionMaestro);
      resultado.push({ h, s, l: Math.max(l - distancia * paso, piso) });
    }
  }
  return resultado;
}

// Tintes: mismo patrón que Sombras, pero aclarando hacia el blanco.
export function getTints(h, s, l, posicionMaestro) {
  const techo = 95;
  const espacio = Math.max(techo - l, 0);
  const distanciaMaxima = Math.max(posicionMaestro - 1, 5 - posicionMaestro);
  const paso = distanciaMaxima > 0 ? espacio / distanciaMaxima : 0;

  const resultado = [];
  for (let posicion = 1; posicion <= 5; posicion++) {
    if (posicion === posicionMaestro) {
      resultado.push({ h, s, l });
    } else {
      const distancia = Math.abs(posicion - posicionMaestro);
      resultado.push({ h, s, l: Math.min(l + distancia * paso, techo) });
    }
  }
  return resultado;
}

// Convierte HSL a un objeto {r, g, b} (0-255 cada uno), reusando hslToHex.
export function hslToRgb(h, s, l) {
  const hex = hslToHex(h, s, l);
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

// Camino inverso: de r,g,b (0-255) a {h, s, l}.
export function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: Math.round(l * 100) };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;

  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// Camino inverso a hslToHex: de un string hex ("#a1b2c3" o "a1b2c3") a {h, s, l}.
// Devuelve null si el texto no es un hex válido de 6 dígitos.
export function hexToHsl(hex) {
  const limpio = hex.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(limpio)) return null;

  const r = parseInt(limpio.slice(0, 2), 16);
  const g = parseInt(limpio.slice(2, 4), 16);
  const b = parseInt(limpio.slice(4, 6), 16);

  return rgbToHsl(r, g, b);
}

// Arma el bloque de texto estilo "Coolors para developers" con todos los formatos.
export function buildExportBlock(colores) {
  const cssHex = colores.map((c) => `  --${c.nombre}: #${c.hex}ff;`).join("\n");
  const cssHsl = colores.map((c) => `  --${c.nombre}: hsla(${c.h}, ${c.s}%, ${c.l}%, 1);`).join("\n");
  const scssHex = colores.map((c) => `$${c.nombre}: #${c.hex}ff;`).join("\n");
  const scssHsl = colores.map((c) => `$${c.nombre}: hsla(${c.h}, ${c.s}%, ${c.l}%, 1);`).join("\n");

  const scssRgb = colores
      .map((c) => {
        const r = parseInt(c.hex.slice(0, 2), 16);
        const g = parseInt(c.hex.slice(2, 4), 16);
        const b = parseInt(c.hex.slice(4, 6), 16);
        return `$${c.nombre}: rgba(${r}, ${g}, ${b}, 1);`;
      })
      .join("\n");

  const listaHex = colores.map((c) => `#${c.hex}ff`).join(", ");

  return [
    "/* CSS HEX */",
    ":root {",
    cssHex,
    "}",
    "",
    "/* CSS HSL */",
    ":root {",
    cssHsl,
    "}",
    "",
    "/* SCSS HEX */",
    scssHex,
    "",
    "/* SCSS HSL */",
    scssHsl,
    "",
    "/* SCSS RGB */",
    scssRgb,
    "",
    "/* SCSS Gradient */",
    `$gradient-top: linear-gradient(0deg, ${listaHex});`,
    `$gradient-right: linear-gradient(90deg, ${listaHex});`,
    `$gradient-bottom: linear-gradient(180deg, ${listaHex});`,
    `$gradient-left: linear-gradient(270deg, ${listaHex});`,
    `$gradient-radial: radial-gradient(${listaHex});`,
  ].join("\n");
}
