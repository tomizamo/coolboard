import { useState } from "react";
import { buildCss } from "../utils/wireframeCss.js";
import "./Wireframe.css";

let contadorId = 100;
function nuevoId() {
  contadorId += 1;
  return contadorId;
}

// Paleta: UN solo contenedor (lo demás son propiedades) + hojas de contenido.
const hojasPaleta = ["Título", "Texto", "Botón", "Imagen"];

// Campos de alto que comparten contenedores y hojas.
const altoPorDefecto = {
  alto: "auto",
  altoPx: 120,
  altoMin: 200,
  altoIdeal: 40,
  altoIdealUnidad: "vh",
  altoMax: 400,
};

function crearNodo(spec) {
  if (spec === "cont") {
    return {
      id: nuevoId(), contenedor: true,
      sistema: "flex", direccion: "columna",
      justify: "flex-start", align: "stretch", gap: 12, columnas: 2,
      crecer: false, ancho: "auto", anchoPx: 200,
      ...altoPorDefecto,
      hijos: [],
    };
  }
  return {
    id: nuevoId(), contenedor: false, etiqueta: spec.slice(5),
    crecer: false, ancho: "auto", anchoPx: 140,
    ...altoPorDefecto,
  };
}

// --- Helpers recursivos sobre el árbol -------------------------------------
function mapArbol(nodo, id, fn) {
  if (nodo.id === id) return fn(nodo);
  if (!nodo.hijos) return nodo;
  return { ...nodo, hijos: nodo.hijos.map((h) => mapArbol(h, id, fn)) };
}

function quitarDelArbol(nodo, id) {
  if (!nodo.hijos) return nodo;
  return {
    ...nodo,
    hijos: nodo.hijos.filter((h) => h.id !== id).map((h) => quitarDelArbol(h, id)),
  };
}

function buscarEnArbol(nodo, id) {
  if (nodo.id === id) return nodo;
  if (!nodo.hijos) return null;
  for (const h of nodo.hijos) {
    const encontrado = buscarEnArbol(h, id);
    if (encontrado) return encontrado;
  }
  return null;
}

// --- Estilo inline en vivo para un nodo (vista previa) ----------------------
function estiloDeAlto(nodo) {
  if (nodo.alto === "fijo") return `${nodo.altoPx}px`;
  if (nodo.alto === "clamp") return `clamp(${nodo.altoMin}px, ${nodo.altoIdeal}${nodo.altoIdealUnidad}, ${nodo.altoMax}px)`;
  return undefined;
}

function estiloDeNodo(nodo) {
  const s = {};
  if (nodo.crecer) s.flex = "1";
  if (nodo.ancho === "fijo") s.width = `${nodo.anchoPx}px`;
  const alto = estiloDeAlto(nodo);
  if (alto) s.height = alto;
  if (nodo.contenedor) {
    s.gap = `${nodo.gap}px`;
    if (nodo.sistema === "grid") {
      s.display = "grid";
      s.gridTemplateColumns = `repeat(${nodo.columnas}, 1fr)`;
    } else {
      s.display = "flex";
      if (nodo.direccion === "columna") s.flexDirection = "column";
      s.justifyContent = nodo.justify;
      s.alignItems = nodo.align;
    }
  }
  return s;
}

// --- Ícono visual: una mini-caja flex con la propiedad real aplicada --------
function MiniIcono({ justify, align }) {
  return (
      <div className="mini-icono" style={{ justifyContent: justify, alignItems: align }}>
        <span style={{ height: "40%" }} />
        <span style={{ height: "75%" }} />
        <span style={{ height: "55%" }} />
      </div>
  );
}

const opcionesJustify = ["flex-start", "center", "flex-end", "space-between", "space-around"];
const opcionesAlign = ["flex-start", "center", "flex-end", "stretch"];

// --- Componente recursivo: se dibuja a sí mismo dentro de sí mismo ----------
function Nodo({ nodo, seleccionadoId, onSeleccionar, onSoltar }) {
  const seleccionado = nodo.id === seleccionadoId;

  if (!nodo.contenedor) {
    return (
        <div
            className={seleccionado ? "wf-caja seleccionado" : "wf-caja"}
            style={estiloDeNodo(nodo)}
            onClick={(e) => { e.stopPropagation(); onSeleccionar(nodo.id); }}
        >
          {nodo.etiqueta}
        </div>
    );
  }

  return (
      <div
          className={seleccionado ? "wf-cont seleccionado" : "wf-cont"}
          style={estiloDeNodo(nodo)}
          onClick={(e) => { e.stopPropagation(); onSeleccionar(nodo.id); }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onSoltar(nodo.id, e.dataTransfer.getData("spec")); }}
      >
        {nodo.hijos.length === 0 && (
            <span className="wf-hint">{nodo.sistema === "grid" ? "grid" : nodo.direccion}</span>
        )}
        {nodo.hijos.map((h) => (
            <Nodo key={h.id} nodo={h} seleccionadoId={seleccionadoId} onSeleccionar={onSeleccionar} onSoltar={onSoltar} />
        ))}
      </div>
  );
}

// --- Control de Alto (compartido por contenedores y hojas) ------------------
function ControlAlto({ nodo, actualizar }) {
  return (
      <>
        <label className="wf-prop-label">Alto</label>
        <div className="wf-botones">
          <button className={nodo.alto === "auto" ? "wf-btn activo" : "wf-btn"} onClick={() => actualizar(nodo.id, { alto: "auto" })}>Auto</button>
          <button className={nodo.alto === "clamp" ? "wf-btn activo" : "wf-btn"} onClick={() => actualizar(nodo.id, { alto: "clamp" })}>Responsivo</button>
          <button className={nodo.alto === "fijo" ? "wf-btn activo" : "wf-btn"} onClick={() => actualizar(nodo.id, { alto: "fijo" })}>Fijo</button>
        </div>

        {nodo.alto === "clamp" && (
            <div className="wf-clamp">
              <div className="wf-clamp-fila">
                <span className="wf-clamp-tag">Mín</span>
                <input className="wf-num" type="number" value={nodo.altoMin} onChange={(e) => actualizar(nodo.id, { altoMin: Number(e.target.value) })} />
                <span className="wf-clamp-unidad">px</span>
              </div>
              <div className="wf-clamp-fila">
                <span className="wf-clamp-tag">Ideal</span>
                <input className="wf-num" type="number" value={nodo.altoIdeal} onChange={(e) => actualizar(nodo.id, { altoIdeal: Number(e.target.value) })} />
                <select className="wf-select" value={nodo.altoIdealUnidad} onChange={(e) => actualizar(nodo.id, { altoIdealUnidad: e.target.value })}>
                  <option value="vh">vh</option>
                  <option value="%">%</option>
                  <option value="vw">vw</option>
                </select>
              </div>
              <div className="wf-clamp-fila">
                <span className="wf-clamp-tag">Máx</span>
                <input className="wf-num" type="number" value={nodo.altoMax} onChange={(e) => actualizar(nodo.id, { altoMax: Number(e.target.value) })} />
                <span className="wf-clamp-unidad">px</span>
              </div>
              <code className="wf-clamp-preview">clamp({nodo.altoMin}px, {nodo.altoIdeal}{nodo.altoIdealUnidad}, {nodo.altoMax}px)</code>
            </div>
        )}

        {nodo.alto === "fijo" && (
            <>
              <input className="wf-num" type="number" value={nodo.altoPx} onChange={(e) => actualizar(nodo.id, { altoPx: Number(e.target.value) })} />
              <span className="wf-aviso">⚠ Un alto fijo suele romperse en otras pantallas. Preferí Auto o Responsivo.</span>
            </>
        )}
      </>
  );
}

// --- App del bosquejador ----------------------------------------------------
export default function Wireframe() {

  const [raiz, setRaiz] = useState({
    id: 0, raiz: true, contenedor: true,
    sistema: "flex", direccion: "columna",
    justify: "flex-start", align: "stretch", gap: 16, columnas: 2, hijos: [],
  });
  const [seleccionadoId, setSeleccionadoId] = useState(0);

  function agregarHijo(padreId, spec) {
    if (!spec) return;
    const nuevo = crearNodo(spec);
    setRaiz((r) => mapArbol(r, padreId, (n) => ({ ...n, hijos: [...n.hijos, nuevo] })));
    setSeleccionadoId(nuevo.id);
  }

  function actualizar(id, cambios) {
    setRaiz((r) => mapArbol(r, id, (n) => ({ ...n, ...cambios })));
  }

  function borrar(id) {
    setRaiz((r) => quitarDelArbol(r, id));
    setSeleccionadoId(0);
  }

  function copiar(texto) {
    navigator.clipboard.writeText(texto);
  }

  const sel = buscarEnArbol(raiz, seleccionadoId);
  const cssFlex = buildCss(raiz);

  return (
      <div className="wireframe">

        {/* Paleta ------------------------------------------------------- */}
        <div className="wireframe-paleta">
          <div className="panel-header"><span>Estructura</span></div>
          <div className="wireframe-chip wireframe-chip-cont" draggable
               onDragStart={(e) => e.dataTransfer.setData("spec", "cont")}>
            ▢ Contenedor
          </div>
          <div className="panel-header wf-paleta-hojas"><span>Contenido</span></div>
          {hojasPaleta.map((h) => (
              <div key={h} className="wireframe-chip" draggable
                   onDragStart={(e) => e.dataTransfer.setData("spec", `hoja:${h}`)}>
                {h}
              </div>
          ))}
        </div>

        {/* Lienzo = la raíz (una columna). Soltar acá agrega a la página. */}
        <div
            className="wireframe-lienzo"
            style={estiloDeNodo(raiz)}
            onClick={() => setSeleccionadoId(0)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); agregarHijo(0, e.dataTransfer.getData("spec")); }}
        >
          {raiz.hijos.length === 0 && (
              <div className="wireframe-vacio">Arrastrá un Contenedor o contenido acá. Las cajas pueden ir adentro de otras cajas.</div>
          )}
          {raiz.hijos.map((h) => (
              <Nodo key={h.id} nodo={h} seleccionadoId={seleccionadoId} onSeleccionar={setSeleccionadoId} onSoltar={agregarHijo} />
          ))}
        </div>

        {/* Panel de propiedades + CSS ----------------------------------- */}
        <div className="wireframe-panel">
          <div className="panel-header">
            <span>{sel ? (sel.raiz ? "Página" : sel.contenedor ? "Contenedor" : sel.etiqueta) : "Nada"}</span>
          </div>

          {sel && (
              <div className="wf-props">

                {sel.contenedor && (
                    <>
                      <label className="wf-prop-label">Sistema</label>
                      <div className="wf-botones">
                        <button className={sel.sistema === "flex" ? "wf-btn activo" : "wf-btn"} onClick={() => actualizar(sel.id, { sistema: "flex" })}>Flex</button>
                        <button className={sel.sistema === "grid" ? "wf-btn activo" : "wf-btn"} onClick={() => actualizar(sel.id, { sistema: "grid" })}>Grid</button>
                      </div>

                      {sel.sistema === "flex" && (
                          <>
                            <label className="wf-prop-label">Dirección</label>
                            <div className="wf-botones">
                              <button className={sel.direccion === "fila" ? "wf-btn activo" : "wf-btn"} onClick={() => actualizar(sel.id, { direccion: "fila" })}>Fila</button>
                              <button className={sel.direccion === "columna" ? "wf-btn activo" : "wf-btn"} onClick={() => actualizar(sel.id, { direccion: "columna" })}>Columna</button>
                            </div>

                            <label className="wf-prop-label">justify-content</label>
                            <div className="wf-iconos">
                              {opcionesJustify.map((v) => (
                                  <button key={v} title={v} className={sel.justify === v ? "wf-icono-btn activo" : "wf-icono-btn"} onClick={() => actualizar(sel.id, { justify: v })}>
                                    <MiniIcono justify={v} align="center" />
                                  </button>
                              ))}
                            </div>
                            <label className="wf-prop-label">align-items</label>
                            <div className="wf-iconos">
                              {opcionesAlign.map((v) => (
                                  <button key={v} title={v} className={sel.align === v ? "wf-icono-btn activo" : "wf-icono-btn"} onClick={() => actualizar(sel.id, { align: v })}>
                                    <MiniIcono justify="center" align={v} />
                                  </button>
                              ))}
                            </div>
                          </>
                      )}

                      {sel.sistema === "grid" && (
                          <>
                            <label className="wf-prop-label">Columnas del grid</label>
                            <input className="wf-num" type="number" min={1} max={12} value={sel.columnas} onChange={(e) => actualizar(sel.id, { columnas: Number(e.target.value) })} />
                          </>
                      )}

                      <label className="wf-prop-label">gap</label>
                      <input className="wf-num" type="number" value={sel.gap} onChange={(e) => actualizar(sel.id, { gap: Number(e.target.value) })} />
                    </>
                )}

                {!sel.raiz && (
                    <>
                      <label className="wf-prop-label">Crecer (flex: 1)</label>
                      <div className="wf-botones">
                        <button className={!sel.crecer ? "wf-btn activo" : "wf-btn"} onClick={() => actualizar(sel.id, { crecer: false })}>No</button>
                        <button className={sel.crecer ? "wf-btn activo" : "wf-btn"} onClick={() => actualizar(sel.id, { crecer: true })}>Sí</button>
                      </div>

                      <label className="wf-prop-label">Ancho</label>
                      <div className="wf-botones">
                        <button className={sel.ancho === "auto" ? "wf-btn activo" : "wf-btn"} onClick={() => actualizar(sel.id, { ancho: "auto" })}>Auto</button>
                        <button className={sel.ancho === "fijo" ? "wf-btn activo" : "wf-btn"} onClick={() => actualizar(sel.id, { ancho: "fijo" })}>Fijo</button>
                      </div>
                      {sel.ancho === "fijo" && (
                          <input className="wf-num" type="number" value={sel.anchoPx} onChange={(e) => actualizar(sel.id, { anchoPx: Number(e.target.value) })} /> )}

                      <ControlAlto nodo={sel} actualizar={actualizar} />

                      <button className="wf-borrar" onClick={() => borrar(sel.id)}>Borrar</button>
                    </>
                )}
              </div>
          )}

          <div className="panel-header wf-css-header"><span>CSS</span></div>
          <pre className="panel-dev-codigo">{cssFlex || "/* Agregá algo para ver el CSS */"}</pre>
          <button className="boton-copiar-todo" onClick={() => copiar(cssFlex)}>Copiar CSS</button>
        </div>

      </div>
  );
}
