// 🔁 Session Setup
async function getOrCreateSession() {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
        try {
            const res = await fetch('/new-session');
            const data = await res.json();
            sessionId = data.sessionId;
            sessionStorage.setItem('sessionId', sessionId);
            console.log('Nueva sesión iniciada:', sessionId);
        } catch (err) {
            console.error('No se pudo crear la sesión:', err);
        }
    } else {
        console.log('Sesión existente encontrada:', sessionId);
    }
    return sessionId;
}

// Question Data
const questions = [
    // Business Setup
    {
        step: 1,
        label: "¿Qué tipo de negocio estás comenzando?",
        type: "multiple",
        options: [
            "Servicio (ej. limpieza, consultoría)",
            "Basado en productos (ej. productos hechos a mano, venta al por menor)",
            "Digital (ej. tienda en línea, creación de contenido)",
            "Basado en comida (ej. catering, food truck)",
            "Otro"
        ]
    },
    {
        step: 2,
        label: "¿Necesitarás una ubicación física?",
        type: "multiple",
        options: [
            "No (desde casa o solo en línea)",
            "Sí (oficina o local rentado)",
            "Sí (comprar un edificio)"
        ]
    },
    {
        step: 3,
        label: "¿Cuál es el costo mensual promedio de licencias, permisos y registros legales?",
        type: "textOrNumber",
        options: ["Costo estimado: ", "Todavía estoy reuniendo detalles"]
    },
    {
        step: 4,
        label: "¿Tienes una cuenta bancaria comercial y/o software de contabilidad?",
        type: "textOrNumber",
        options: ["Costo mensual estimado: ", "Manejaré las finanzas manualmente (nota: riesgoso a largo plazo)"]
    },

    // Start-Up Expenses
    {
        step: 5,
        label: "¿Cuánto costará lanzar tu producto o servicio (insumos, equipo, empaque, etc.)?",
        type: "multiple",
        options: ["$0–$500", "$500–$5,000", "$5,000–$25,000", "Más de $25,000"]
    },
    {
        step: 6,
        label: "¿Planeas contratar empleados o contratistas en tu primer año?",
        type: "textOrNumber",
        options: ["Sí – Nómina mensual estimada: ", "No – Lo manejaré yo solo"]
    },
    {
        step: 7,
        label: "¿Qué tecnología necesitarás (sitio web, sistema POS, dominio, hosting, diseño, herramientas)?",
        type: "dualInput",
        options: ["Total estimado de inicio:", "Costo mensual continuo:"]
    },

    // Personal Finance Impact
    {
        step: 8,
        label: "¿Tienes ahorros apartados específicamente para tu negocio?",
        type: "textOrNumber",
        options: ["Sí – Cantidad: ", "No"]
    },
    {
        step: 9,
        label: "¿Cuántos meses puedes cubrir tus gastos personales mientras tu negocio gana poco o ningún ingreso?",
        type: "multiple",
        options: ["0–6 meses", "6–12 meses", "1–2 años", "Más de 2 años"]
    },
    {
        step: 10,
        label: "¿Dependes de un préstamo o crédito para comenzar tu negocio?",
        type: "textOrNumber",
        options: ["Sí – Cantidad: ", "No – Autofinanciado"]
    },

    // Ongoing Costs
    {
        step: 11,
        label: "¿Cuáles de los siguientes serán costos mensuales recurrentes para tu negocio? (marca todos los que correspondan)",
        type: "checkbox",
        options: [
            "Renta o hipoteca",
            "Internet y teléfono",
            "Servicios públicos",
            "Suscripciones de software (QuickBooks, Canva, Shopify, etc.)",
            "Mercadeo/publicidad",
            "Reposición de inventario",
            "Pago de préstamos"
        ]
    },
    {
        step: 12,
        label: "¿Has creado un presupuesto mensual o una proyección de ingresos/gastos para tu primer año?",
        type: "multiple",
        options: ["Sí", "No – Todavía estoy trabajando en eso"]
    },
    {
        step: 13,
        label: "¿Cuánta ganancia esperas obtener de manera realista en los primeros 12 meses?",
        type: "multiple",
        options: ["Ninguna – Solo cubrir gastos", "$1–$5,000", "$5,000–$20,000", "Más de $20,000"]
    },
    {
        step: 14,
        label: "¿Conoces tu punto de equilibrio (cuánto debes vender para cubrir tus costos)?",
        type: "multiple",
        options: ["Sí", "No – Aún lo estoy calculando"]
    },

    // Final Reflection
    {
        step: 15,
        label: "¿Cómo se verá el éxito para ti en tu primer año?",
        type: "textarea"
    },
    {
        step: 16,
        label: "¿Qué sacrificios estás dispuesto a hacer para poner en marcha tu negocio?",
        type: "multiple",
        options: [
            "Tiempo con amigos/familia",
            "Reducir gastos personales",
            "Trabajar en otro empleo al mismo tiempo",
            "Retrasar metas personales",
            "Aún no estoy seguro"
        ]
    }
];

let currentStep = 0;
let sessionId = null;

// Load initial question
document.addEventListener("DOMContentLoaded", async () => {
    sessionId = await getOrCreateSession();
    loadQuestion(currentStep);
});

// Render Question
function loadQuestion(index) {
    const container = document.getElementById("question-container");
    container.innerHTML = "";
    const q = questions[index];

    const label = document.createElement("h2");
    label.textContent = `${q.step}. ${q.label}`;
    container.appendChild(label);

    const inputDiv = document.createElement("div");
    inputDiv.id = "input-area";

    if (q.type === "multiple") {
        q.options.forEach(opt => {
            const btn = document.createElement("button");
            btn.textContent = opt;
            btn.className = "option-button";
            btn.addEventListener("click", () => {
                document.querySelectorAll(".option-button").forEach(b => b.classList.remove("selected"));
                btn.classList.add("selected");
            });
            inputDiv.appendChild(btn);
        });
    } else if (q.type === "textOrNumber") {
        q.options.forEach(opt => {
            const wrapper = document.createElement("div");

            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = "choice";
            radio.value = opt;

            const labelText = document.createElement("label");
            labelText.textContent = opt.includes(":") ? opt.split(":")[0] : opt;

            wrapper.appendChild(radio);
            wrapper.appendChild(labelText);

            const optLower = opt.toLowerCase();
            if (
                optLower.includes("estimado") ||
                optLower.includes("cantidad") ||
                optLower.includes("costo") ||
                opt.includes(":")
            ) {
                const input = document.createElement("input");
                input.type = "number";
                input.placeholder = "$0";
                input.min = "0";
                input.step = "0.01";
                input.inputMode = "decimal";
                input.className = "inline-input";

                input.addEventListener("input", () => {
                    if (input.value.trim() !== "") {
                        radio.checked = true;
                    }
                });

                wrapper.appendChild(input);
            }

            inputDiv.appendChild(wrapper);
        });
    } else if (q.type === "dualInput") {
        q.options.forEach(opt => {
            const label = document.createElement("label");
            label.textContent = opt;

            const input = document.createElement("input");
            input.type = "number";
            input.placeholder = "$0";
            input.className = "inline-input";

            inputDiv.appendChild(label);
            inputDiv.appendChild(input);
        });
    } else if (q.type === "checkbox") {
        q.options.forEach(opt => {
            const wrapper = document.createElement("div");

            const check = document.createElement("input");
            check.type = "checkbox";
            check.value = opt;

            const label = document.createElement("label");
            label.textContent = opt;

            wrapper.appendChild(check);
            wrapper.appendChild(label);
            inputDiv.appendChild(wrapper);
        });
    } else if (q.type === "textarea") {
        const textarea = document.createElement("textarea");
        textarea.id = "answer-text";
        textarea.rows = 4;
        textarea.placeholder = "Escriba su respuesta aquí...";
        inputDiv.appendChild(textarea);
    }

    container.appendChild(inputDiv);
    updateProgress();
}

// Save Answer
async function saveAnswer(skip = false) {
    const q = questions[currentStep];
    let answer = "";

    if (q.type === "multiple") {
        const selected = document.querySelector(".option-button.selected");
        if (selected) answer = selected.textContent;
    } else if (q.type === "textOrNumber") {
        const selected = document.querySelector("input[name='choice']:checked");
        if (selected) {
            answer = selected.value;
            const input = selected.parentElement.querySelector(".inline-input");
            if (input && input.value.trim()) answer += " $" + input.value.trim();
        }
    } else if (q.type === "dualInput") {
        const inputs = document.querySelectorAll(".inline-input");
        answer = Array.from(inputs).map(inp => "$" + inp.value.trim()).join(", ");
    } else if (q.type === "checkbox") {
        const checked = document.querySelectorAll("input[type='checkbox']:checked");
        answer = Array.from(checked).map(c => c.value).join(", ");
    } else if (q.type === "textarea") {
        answer = document.getElementById("answer-text").value.trim();
    }

    if (!skip && !answer) {
        alert("Por favor responda o haga clic en Saltar.");
        return;
    }

    await fetch("/save-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, step: q.step, answer })
    });

    currentStep++;
    if (currentStep < questions.length) {
        loadQuestion(currentStep);
    } else {
        window.location.href = "/es/summary.html";
    }
}

// Progress Bar
function updateProgress() {
    const progress = ((currentStep + 1) / questions.length) * 100;
    document.querySelector(".progress-fill").style.width = `${progress}%`;
}

// Button Listeners
document.getElementById("next-button").addEventListener("click", () => saveAnswer(false));
document.getElementById("skip-button").addEventListener("click", () => saveAnswer(true));
document.getElementById("back-button").addEventListener("click", () => {
    if (currentStep > 0) {
        currentStep--;
        loadQuestion(currentStep);
    }
});