
2. **Acceder a la gestión de extensiones:**
   * Abre tu navegador y escribe en la barra de direcciones: `chrome://extensions/`
   * Presiona `Enter`.

3. **Activar Modo Desarrollador:**
   * En la esquina superior derecha, activa el interruptor que dice **"Modo de desarrollador"**.

4. **Cargar la extensión:**
   * Haz clic en el botón **"Cargar descomprimida"** (Load unpacked) que aparecerá en la parte superior izquierda.
   * Selecciona la carpeta donde guardaste este proyecto.

5. **¡Listo!**
   * Verás el icono de "Detector de Phishing" en tu lista de extensiones. 
   * Ahora, para probarlo, abre la consola del navegador (`F12` > pestaña `Console`) mientras navegas en 
   **Es en consola habre la consoloa y ahi  veras se activa solo cuando eentras a una web**
   cualquier sitio web. La extensión analizará el DOM y mostrará el puntaje de riesgo y las alertas detectadas.

## 🧠 Funcionamiento Técnico

* **Extracción:** Se captura el texto visible (`innerText`) de la página actual.
* **Análisis:** El script compara el texto contra una serie de patrones predefinidos (urgencia, avaricia, camuflaje léxico, etc.).
* **Scoring:** Se calcula un puntaje basado en el peso de cada amenaza encontrada.
    * 🟢 **Riesgo Bajo:** 0-30 pts.
    * 🟡 **Riesgo Medio:** 31-70 pts.
    * 🔴 **Riesgo Alto:** 71+ pts.

## 🛠️ Tecnologías utilizadas
* JavaScript (ES6)
* Manifest V3 (Google Chrome Extensions)
* RegEx (Lenguajes Formales)

---
*Proyecto desarrollado para la materia de Lenguajes Formales y Autómatas.*