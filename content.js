const PATRONES = {
    urgencia: {
        regex: /\b(?:urgente|inmediato|alerta|bloquead[oa]|suspendid[oa]|restringid[oa]|peligro|caducad[oa]|cancelad[oa])\b/gi,
        label: "Urgencia",
        color: "#fc5c65",
        puntosPerMatch: 15
    },
    avaricia: {
        regex: /\b(?:gratis|ganador(?:es)?|premio(?:s)?|cripto(?:monedas?)?|bitcoin|inversi[oó]n(?:es)?|d[oó]lares|dinero\sf[aá]cil|oferta(?:s)?)\b/gi,
        label: "Engaño / Avaricia",
        color: "#fd9644",
        puntosPerMatch: 10
    },
    accion: {
        regex: /\b(?:haz\sclic|clic\saqu[ií]|verifica(?:\stu\scuenta)?|actualiza(?:\stus\sdatos)?|inicia\ssesi[oó]n|restablece(?:r)?(?:\stu\scontrase[ñn]a)?)\b/gi,
        label: "Llamada a Acción",
        color: "#fed330",
        puntosPerMatch: 25
    },
    camuflaje: {
        // Exige que haya letras DESPUÉS de los números/símbolos (ej. p4ssw0rd, b4nc0)
        // Esto ignora palabras que solo terminan en números como bob496 o t90
        regex: /\b[a-zA-Z]+[0-9$!]+[a-zA-Z]+[a-zA-Z0-9]*\b/g,
        label: "Texto Camuflado",
        color: "#a55eea",
        puntosPerMatch: 30
    },
    archivos: {
        regex: /\b[\w-]+\.(exe|bat|scr|vbs|apk)\b/gi,
        label: "Archivos Peligrosos",
        color: "#ff4757",
        puntosPerMatch: 40
    },

    // nuevos patrones 
    enlacesIp: {
        regex: /https?:\/\/\d{1,3}(\.\d{1,3}){3}/gi,
        label: "URL Sospechosa (IP)",
        color: "#4b7bec", // Azul para enlaces
        puntosPerMatch: 50 // Riesgo altísimo, casi ningún sitio legítimo usa IPs directas hoy en día
    },
    exclamacion: {
        regex: /!{3,}|¡{3,}/g, // Detecta 3 o más signos, tanto de apertura (¡) como de cierre (!)
        label: "Gritos (Exclamación)",
        color: "#fa8231", // Naranja fuerte
        puntosPerMatch: 10
    },
    mayusculas: {
        // Busca bloques de texto de al menos 25 caracteres que sean PURAS mayúsculas y espacios.
        // Ignorará botones cortos, pero atrapará oraciones enteras "gritadas".
        regex: /\b[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s]{25,}\b/g,
        label: "Gritos en Mayúsculas",
        color: "#eb3b5a",
        puntosPerMatch: 15 // Le subimos el puntaje porque si alguien escribe 25 letras en mayúscula, es sospechoso
    }
};

// ─────────────────────────────────────────────
// ANÁLISIS: recorre el texto de la página y recoge estadísticas
// ─────────────────────────────────────────────
function analizarPagina() {
    const texto = document.body.innerText;
    let puntosTotal = 0; // suma de todos los puntos de riesgo
    const estadisticas = {}; // detalles de cada categoria

    for (const [clave, patron] of Object.entries(PATRONES)) {
        // Resetear lastIndex para evitar bugs con regex globales
        const regex = new RegExp(patron.regex.source, patron.regex.flags);
        const coincidencias = texto.match(regex) || [];
        const unicas = [...new Set(coincidencias.map(w => w.toLowerCase()))];
        const puntos = coincidencias.length * patron.puntosPerMatch;
        puntosTotal += puntos;

        estadisticas[clave] = {
            label: patron.label,
            color: patron.color,
            total: coincidencias.length,
            palabras: unicas,
            puntos
        };
    }

    return { puntosTotal, estadisticas };
}

// ─────────────────────────────────────────────
// RESALTADO: envuelve las palabras detectadas en <span> coloreados
// ─────────────────────────────────────────────
function resaltarDOM() {
    limpiarResaltado();
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode(nodo) {
                const tag = nodo.parentElement?.tagName?.toUpperCase();
                const skip = ["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT", "CODE", "PRE"];
                if (skip.includes(tag)) return NodeFilter.FILTER_REJECT;
                if (nodo.parentElement?.hasAttribute("data-phishing")) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );

    // Recolectar nodos antes de modificar (modificar durante iteración rompe el walker)
    const nodos = [];
    while (walker.nextNode()) nodos.push(walker.currentNode);

    for (const nodo of nodos) {
        const texto = nodo.textContent;
        if (!texto.trim()) continue;

        // Recoger todas las coincidencias de todos los patrones en este nodo
        const todasCoincidencias = [];
        for (const patron of Object.values(PATRONES)) {
            const regex = new RegExp(patron.regex.source, patron.regex.flags);
            let match;
            while ((match = regex.exec(texto)) !== null) {
                todasCoincidencias.push({
                    inicio: match.index,
                    fin: match.index + match[0].length,
                    texto: match[0],
                    color: patron.color,
                    label: patron.label
                });
            }
        }

        if (todasCoincidencias.length === 0) continue;

        // Ordenar por posición y eliminar solapamientos
        todasCoincidencias.sort((a, b) => a.inicio - b.inicio);

        const fragmento = document.createDocumentFragment();
        let cursor = 0;

        for (const m of todasCoincidencias) {
            if (m.inicio < cursor) continue; // saltar solapamientos

            // Texto antes de la coincidencia
            if (m.inicio > cursor) {
                fragmento.appendChild(document.createTextNode(texto.slice(cursor, m.inicio)));
            }

            // Span resaltado
            const span = document.createElement("span");
            span.setAttribute("data-phishing", m.label);
            span.style.cssText = `
        background-color: ${m.color};
        color: #000;
        border-radius: 3px;
        padding: 1px 3px;
        font-weight: bold;
        cursor: help;
        outline: 1px solid ${m.color}cc;
      `;
            span.title = `⚠️ ${m.label}`;
            span.textContent = m.texto;
            fragmento.appendChild(span);

            cursor = m.fin;
        }

        // Texto restante después de la última coincidencia
        if (cursor < texto.length) {
            fragmento.appendChild(document.createTextNode(texto.slice(cursor)));
        }

        nodo.parentNode.replaceChild(fragmento, nodo);
    }
}

// ─────────────────────────────────────────────
// LIMPIEZA: elimina todos los spans de resaltado previos
// ─────────────────────────────────────────────
function limpiarResaltado() {
    document.querySelectorAll("span[data-phishing]").forEach(span => {
        span.replaceWith(document.createTextNode(span.textContent));
    });
}

// ─────────────────────────────────────────────
// ESCUCHA DE MENSAJES desde popup.js
// ─────────────────────────────────────────────
chrome.runtime.onMessage.addListener((mensaje, _sender, responder) => {
    if (mensaje.accion === "analizar") {
        const resultado = analizarPagina();
        resaltarDOM();
        responder(resultado);
    } else if (mensaje.accion === "limpiar") {
        limpiarResaltado();
        responder({ ok: true });
    }
    return true; // necesario para respuestas asíncronas
});
