// content.js
console.log("🕵️‍♂️ Detector de Phishing inyectado en la página...");

// 1. EXTRAER EL TEXTO
// La propiedad 'innerText' saca todo el texto visible de la página, ignorando los códigos HTML.
const textoPagina = document.body.innerText;

// 1. PATRÓN DE URGENCIA Y MIEDO (Urgency/Threats)
// Detecta variaciones de género (bloqueado/a) y palabras clave de pánico.
const patronUrgencia = /\b(urgente|inmediato|alerta|bloquead[oa]|suspendid[oa]|restringid[oa]|peligro|caducad[oa]|cancelad[oa])\b/gi;

// 2. PATRÓN DE AVARICIA Y PREMIOS (Greed/Financial)
// Usa '?' para hacer opcionales las terminaciones en plural (premio o premios).
const patronAvaricia = /\b(gratis|ganador(es)?|premio(s)?|cripto(monedas?)?|bitcoin|inversi[óo]n(es)?|d[óo]lares|dinero f[aá]cil|oferta(s)?)\b/gi;

// 3. PATRÓN DE ACCIÓN PELIGROSA (Phishing Call to Action)
// Detecta frases exactas que obligan al usuario a interactuar con enlaces falsos.
const patronAccion = /\b(haz clic|clic aqu[ií]|verifica( tu cuenta)?|actualiza( tus datos)?|inicia sesi[oó]n|restablece(r)?( tu contrase[ñn]a)?)\b/gi;

// 4. PATRÓN DE CAMUFLAJE LÉXICO (Leet Speak / Ofuscación)
// Busca palabras que empiezan con letras pero mezclan números o símbolos en el medio (ej. p4ssw0rd, b4nc0, cu3nt4).
const patronCamuflaje = /\b[a-zA-Z]+[0-9@$!]+[a-zA-Z0-9]*\b/g;

// 5. PATRÓN DE ARCHIVOS ADJUNTOS PELIGROSOS
// Detecta menciones a extensiones de archivos que suelen contener malware.
const patronArchivos = /\b[\w-]+\.(exe|bat|scr|vbs|apk)\b/gi;

// Contadores para el Scoring
let puntosRiesgo = 0;

// Buscar coincidencias (retorna un arreglo con las palabras encontradas o null)
const matchesUrgencia = textoPagina.match(patronUrgencia) || [];
const matchesAvaricia = textoPagina.match(patronAvaricia) || [];
const matchesAccion = textoPagina.match(patronAccion) || [];
const matchesCamuflaje = textoPagina.match(patronCamuflaje) || [];
const matchesArchivos = textoPagina.match(patronArchivos) || [];

// Asignar peso a cada tipo de amenaza
puntosRiesgo += matchesUrgencia.length * 15; // La urgencia suma 15 puntos por palabra
puntosRiesgo += matchesAvaricia.length * 10; // La avaricia suma 10 puntos
puntosRiesgo += matchesAccion.length * 25;   // Pedir clics suma 25 puntos (muy riesgoso)
puntosRiesgo += matchesCamuflaje.length * 30;// Ocultar palabras es casi seguro un fraude
puntosRiesgo += matchesArchivos.length * 40; // Archivos .exe o .apk son críticos

console.log(`Puntaje total de riesgo: ${puntosRiesgo}`);

// Clasificación de Riesgo
if (puntosRiesgo >= 71) {
    console.log("🔴 RIESGO ALTO: Posible ataque crítico de Phishing.");
} else if (puntosRiesgo >= 31) {
    console.log("🟡 RIESGO MEDIO: Precaución, el mensaje es dudoso.");
} else if (puntosRiesgo > 0) {
    console.log("🟢 RIESGO BAJO: Se encontraron coincidencias menores.");
} else {
    console.log("✅ Mensaje limpio.");
}