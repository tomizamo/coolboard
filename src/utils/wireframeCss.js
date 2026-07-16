// El nombre de clase que le toca a cada nodo en el CSS generado.
// Se EXPORTA porque el panel también lo muestra, para que puedas ubicar
// el bloque seleccionado en el código de abajo.
export function claseDe(nodo) {
  if (nodo.raiz) return "pagina";
  if (nodo.contenedor) {
    if (nodo.sistema === "grid") return `grid-${nodo.id}`;
    return `${nodo.direccion}-${nodo.id}`;
  }
  return `caja-${nodo.id}`;
}

// Traduce una medida (ancho o alto) a un valor CSS. eje es "ancho" o "alto";
// las propiedades del nodo se llaman anchoPx/anchoMin/... o altoPx/altoMin/...
// así que armamos la clave con el prefijo del eje.
export function valorMedida(nodo, eje) {
  const tipo = nodo[eje];
  if (tipo === "fijo") return `${nodo[`${eje}Px`]}px`;
  if (tipo === "clamp") {
    return `clamp(${nodo[`${eje}Min`]}px, ${nodo[`${eje}Ideal`]}${nodo[`${eje}IdealUnidad`]}, ${nodo[`${eje}Max`]}px)`;
  }
  return null; // auto: sin regla, lo decide el contenido
}

// Las propiedades CSS que necesita UN nodo, como líneas de texto.
function propsDeNodo(nodo) {
  const p = [];

  if (nodo.contenedor) {
    if (nodo.sistema === "grid") {
      p.push("display: grid;");
      p.push(`grid-template-columns: repeat(${nodo.columnas}, 1fr);`);
      // stretch es el default de grid: solo mostramos la regla si la cambiaste.
      if (nodo.gridJustify !== "stretch") p.push(`justify-items: ${nodo.gridJustify};`);
      if (nodo.gridAlign !== "stretch") p.push(`align-items: ${nodo.gridAlign};`);
    } else {
      p.push("display: flex;");
      if (nodo.direccion === "columna") p.push("flex-direction: column;");
      p.push(`justify-content: ${nodo.justify};`);
      p.push(`align-items: ${nodo.align};`);
    }
    p.push(`gap: ${nodo.gap}px;`);
  }

  // Estas valen para cualquier nodo, sea contenedor u hoja:
  if (nodo.crecer) p.push("flex: 1;");

  const w = valorMedida(nodo, "ancho");
  if (w) p.push(`width: ${w};`);
  const h = valorMedida(nodo, "alto");
  if (h) p.push(`height: ${h};`);

  if (nodo.padding > 0) p.push(`padding: ${nodo.padding}px;`);
  if (nodo.color) p.push(`background: ${nodo.color};`);

  if (nodo.radioTipo === "circulo") p.push("border-radius: 50%;");
  else if (nodo.radioPx > 0) p.push(`border-radius: ${nodo.radioPx}px;`);

  return p;
}

// Recorre el árbol entero y junta el CSS de todos los nodos (recursión).
export function buildCss(raiz) {
  const reglas = [];

  function recorrer(nodo) {
    const props = propsDeNodo(nodo);
    if (props.length > 0) {
      reglas.push(`.${claseDe(nodo)} {\n  ${props.join("\n  ")}\n}`);
    }
    if (nodo.hijos) {
      nodo.hijos.forEach(recorrer);
    }
  }

  recorrer(raiz);
  return reglas.join("\n\n");
}
