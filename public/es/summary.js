document.addEventListener("DOMContentLoaded", async () => {
    const sessionId = sessionStorage.getItem("sessionId");

    if (!sessionId) {
        alert("No se encontró ninguna sesión. Por favor comienza de nuevo.");
        window.location.href = "/es/form.html";
        return;
    }

    try {
        const res = await fetch(`/get-summary/${sessionId}`);
        const data = await res.json();

        if (data.error) {
            alert("Sesión no encontrada.");
            window.location.href = "/es/form.html";
            return;
        }

        renderSummary(data.answers || {});
    } catch (err) {
        console.error("Error loading summary:", err);
        alert("No se pudo cargar el resumen.");
    }
});

function renderSummary(answers) {
    const answersDiv = document.getElementById("answers");
    const recommendationsList = document.getElementById("recommendations");

    answersDiv.innerHTML = "";
    recommendationsList.innerHTML = "";

    const questionLabels = [
        "¿Qué tipo de negocio estás comenzando?",
        "¿Necesitarás una ubicación física?",
        "¿Cuál es el costo mensual promedio de licencias, permisos y registros legales?",
        "¿Tienes una cuenta bancaria comercial y/o software de contabilidad?",
        "¿Cuánto costará lanzar tu producto o servicio (insumos, equipo, empaque, etc.)?",
        "¿Planeas contratar empleados o contratistas en tu primer año?",
        "¿Qué tecnología necesitarás (sitio web, sistema POS, dominio, hosting, diseño, herramientas)?",
        "¿Tienes ahorros apartados específicamente para tu negocio?",
        "¿Cuántos meses puedes cubrir tus gastos personales mientras tu negocio gana poco o ningún ingreso?",
        "¿Dependes de un préstamo o crédito para comenzar tu negocio?",
        "¿Cuáles de los siguientes serán costos mensuales recurrentes para tu negocio? (marca todos los que correspondan)",
        "¿Has creado un presupuesto mensual o una proyección de ingresos/gastos para tu primer año?",
        "¿Cuánta ganancia esperas obtener de manera realista en los primeros 12 meses?",
        "¿Conoces tu punto de equilibrio (cuánto debes vender para cubrir tus costos)?",
        "¿Cómo se verá el éxito para ti en tu primer año?",
        "¿Qué sacrificios estás dispuesto a hacer para poner en marcha tu negocio?"
    ];

    const recs = [];

    for (let i = 1; i <= questionLabels.length; i++) {
        const value = answers[i] || "";

        const item = document.createElement("div");
        item.className = "answer-item";

        const label = document.createElement("h3");
        label.textContent = `${i}. ${questionLabels[i - 1]}`;

        const response = document.createElement("p");
        if (value && value.trim() !== "") {
            response.textContent = value;
        } else {
            response.innerHTML = `<span class="skipped">(Omitido)</span>`;
        }

        item.appendChild(label);
        item.appendChild(response);
        answersDiv.appendChild(item);
    }

    // Recommendations logic
    const q3 = (answers[3] || "").toLowerCase();
    const q4 = (answers[4] || "").toLowerCase();
    const q8 = (answers[8] || "").toLowerCase();
    const q9 = (answers[9] || "").toLowerCase();
    const q10 = (answers[10] || "").toLowerCase();
    const q11 = (answers[11] || "").toLowerCase();
    const q12 = (answers[12] || "").toLowerCase();
    const q13 = (answers[13] || "").toLowerCase();
    const q14 = (answers[14] || "").toLowerCase();
    const q15 = (answers[15] || "").trim();
    const q16 = (answers[16] || "").toLowerCase();

    if (!answers[3] || q3.includes("todavía")) {
        recs.push("Necesitas reunir mejor los detalles sobre licencias, permisos y registros legales para evitar costos sorpresa.");
    }

    if (!answers[4] || q4.includes("manual")) {
        recs.push("Considera abrir una cuenta bancaria comercial y usar una herramienta de contabilidad para mantener tus finanzas organizadas.");
    }

    if (!answers[8] || q8 === "no") {
        recs.push("Intenta apartar algunos ahorros específicamente para tu negocio antes de lanzar.");
    }

    if (!answers[9] || q9.includes("0–6")) {
        recs.push("Tu margen financiero personal parece ajustado. Considera crear un colchón más fuerte antes de depender del negocio.");
    }

    if (answers[10] && q10.includes("sí")) {
        recs.push("Como dependes de préstamo o crédito, asegúrate de que tu plan incluya pagos mensuales realistas y flujo de caja.");
    }

    if (answers[11] && q11.length > 0) {
        recs.push("Revisa cuidadosamente tus costos mensuales recurrentes para asegurarte de que tus ingresos proyectados puedan sostenerlos.");
    } else {
        recs.push("Haz una lista clara de tus gastos mensuales recurrentes para entender el costo real de operar tu negocio.");
    }

    if (!answers[12] || q12.includes("no")) {
        recs.push("Debes crear un presupuesto mensual o una proyección de ingresos/gastos para tu primer año.");
    }

    if (answers[13] && q13.includes("ninguna")) {
        recs.push("Si esperas no obtener ganancia al principio, asegúrate de tener suficiente respaldo financiero para sostenerte.");
    }

    if (!answers[14] || q14.includes("no")) {
        recs.push("Necesitas calcular tu punto de equilibrio para saber cuánto debes vender para cubrir tus costos.");
    }

    if (!q15) {
        recs.push("Define una visión clara de cómo se verá el éxito en tu primer año para mantener tus decisiones enfocadas.");
    }

    if (answers[16] && q16.includes("aún no estoy seguro")) {
        recs.push("Piensa con honestidad qué sacrificios estás dispuesto a hacer, porque lanzar un negocio casi siempre exige tiempo, dinero o comodidad.");
    }

    if (recs.length === 0) {
        const li = document.createElement("li");
        li.textContent = "✅ Todas tus respuestas se ven muy bien. ¡Estás listo para avanzar!";
        recommendationsList.appendChild(li);
    } else {
        recs.forEach(rec => {
            const li = document.createElement("li");
            li.textContent = rec;
            recommendationsList.appendChild(li);
        });
    }

    const pdfButton = document.getElementById("download-pdf");
    if (pdfButton) {
        pdfButton.addEventListener("click", downloadPDF);
    }
}

function restart() {
    sessionStorage.removeItem("sessionId");
    window.location.href = "/es/form.html";
}

function downloadPDF() {
    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();
    const container = document.querySelector(".container");

    if (!container) {
        alert("No se pudo encontrar el contenido para exportar.");
        return;
    }

    html2canvas(container, {
        scale: 2,
        useCORS: true
    }).then(canvas => {
        const imgData = canvas.toDataURL("image/png");
        const imgWidth = 190;
        const pageHeight = 295;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 10;

        doc.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight + 10;
            doc.addPage();
            doc.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        doc.save("ResumenDeNegocio.pdf");
    }).catch(err => {
        console.error("PDF export failed:", err);
        alert("La exportación del PDF falló.");
    });
}