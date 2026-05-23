// popup.js — Lógica del popup: envía mensajes al content script y renderiza resultados.

const CONFIG_RIESGO = {
  alto:   { min: 71,  clase: "risk-alto",   emoji: "🔴", label: "RIESGO ALTO",   desc: "Alerta de Phishing / Spam" },
  medio:  { min: 31,  clase: "risk-medio",  emoji: "🟡", label: "RIESGO MEDIO",  desc: "Contenido sospechoso" },
  bajo:   { min: 1,   clase: "risk-bajo",   emoji: "🟢", label: "RIESGO BAJO",   desc: "Coincidencias menores" },
  limpio: { min: 0,   clase: "risk-limpio", emoji: "✅", label: "LIMPIO",         desc: "Sin amenazas detectadas" }
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function getNivelRiesgo(puntos) {
  if (puntos >= 71) return CONFIG_RIESGO.alto;
  if (puntos >= 31) return CONFIG_RIESGO.medio;
  if (puntos > 0)   return CONFIG_RIESGO.bajo;
  return CONFIG_RIESGO.limpio;
}

function setLoading(activo) {
  document.getElementById("loading").style.display = activo ? "block" : "none";
  document.getElementById("btn-analizar").disabled = activo;
  document.getElementById("btn-analizar").textContent = activo ? "⌛ Analizando..." : "⚡ Analizar Página";
}

function mostrarResultados(datos) {
  const { puntosTotal, estadisticas } = datos;
  const nivel = getNivelRiesgo(puntosTotal);

  // Ocultar estado idle
  document.getElementById("idle-state").style.display = "none";

  // Construir HTML del resultado
  const seccionesHTML = Object.entries(estadisticas).map(([, cat]) => {
    const tieneDetecciones = cat.total > 0;
    const palabrasHTML = tieneDetecciones
      ? cat.palabras.map(p =>
          `<span class="palabra-tag" style="background:${cat.color}">${p}</span>`
        ).join("")
      : `<span class="sin-detecciones">sin coincidencias</span>`;

    return `
      <div class="categoria">
        <div class="categoria-header">
          <div class="cat-nombre">
            <div class="cat-dot" style="background:${cat.color}"></div>
            ${cat.label}
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span class="cat-puntos">+${cat.puntos}pts</span>
            <span class="cat-badge">${cat.total}</span>
          </div>
        </div>
        <div class="cat-palabras">${palabrasHTML}</div>
      </div>
    `;
  }).join("");

  document.getElementById("resultado").innerHTML = `
    <div class="score-card ${nivel.clase}">
      <div class="score-number">${puntosTotal}</div>
      <div>
        <div class="score-label">${nivel.emoji} ${nivel.label}</div>
        <div class="score-desc">${nivel.desc}</div>
      </div>
    </div>
    <p class="section-title">Detalle por categoría</p>
    ${seccionesHTML}
    <div style="height:8px;"></div>
  `;

  document.getElementById("resultado").style.display = "block";
  document.getElementById("footer-actions").style.display = "flex";
  document.getElementById("btn-analizar").style.display = "none";
}

// ─────────────────────────────────────────────
// ENVIAR MENSAJE AL CONTENT SCRIPT
// ─────────────────────────────────────────────
async function enviarMensaje(accion) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tab.id, { accion }, (respuesta) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(respuesta);
      }
    });
  });
}

async function ejecutarAnalisis() {
  setLoading(true);
  try {
    // Pequeño delay para que el efecto de carga sea visible
    await new Promise(r => setTimeout(r, 350));
    const datos = await enviarMensaje("analizar");
    mostrarResultados(datos);
  } catch (err) {
    document.getElementById("idle-state").innerHTML = `
      <div class="idle-icon">⚠️</div>
      <p class="idle-text" style="color:#fc5c65;">
        No se pudo conectar con la página.<br>
        <span style="color:var(--muted);font-size:11px;">Recarga la pestaña e intenta de nuevo.</span>
      </p>
    `;
    console.error("Error al analizar:", err);
  } finally {
    setLoading(false);
  }
}

async function limpiarResaltado() {
  try {
    await enviarMensaje("limpiar");
    // Volver al estado inicial
    document.getElementById("resultado").style.display = "none";
    document.getElementById("footer-actions").style.display = "none";
    document.getElementById("btn-analizar").style.display = "block";
    document.getElementById("idle-state").style.display = "block";
    document.getElementById("idle-state").innerHTML = `
      <div class="idle-icon">🔍</div>
      <p class="idle-text">Presiona el botón para escanear<br>el contenido de esta página.</p>
    `;
  } catch (err) {
    console.error("Error al limpiar:", err);
  }
}

// ─────────────────────────────────────────────
// EVENTOS
// ─────────────────────────────────────────────
document.getElementById("btn-analizar").addEventListener("click", ejecutarAnalisis);
document.getElementById("btn-limpiar").addEventListener("click", limpiarResaltado);
document.getElementById("btn-reanalizar").addEventListener("click", ejecutarAnalisis);
