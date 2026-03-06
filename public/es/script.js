// 🔁 Session Setup
async function getOrCreateSession() {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
        try {
            const res = await fetch('/new-session');
            const data = await res.json();
            sessionId = data.sessionId;
            sessionStorage.setItem('sessionId', sessionId);
            console.log('New session started:', sessionId);
        } catch (err) {
            console.error('Failed to create session:', err);
        }
    } else {
        console.log('Existing session found:', sessionId);
    }
    return sessionId;
}

// Question Data
const questions = [
    // Business Setup
    {
        step: 1,
        label: "What kind of business are you starting?",
        type: "multiple",
        options: [
            "Service (E.g., Cleaning, Consulting)",
            "Product-based (E.g., Handmade Goods, Retail)",
            "Digital (E.g., Online Store, Content Creation)",
            "Food-based (E.g., Catering, Food Truck)",
            "Other"
        ]
    },
    {
        step: 2,
        label: "Will you need a physical location?",
        type: "multiple",
        options: [
            "No (Home-based or online only)",
            "Yes, (Rented office/Storefront)",
            "Yes, (Purchase a building)"
        ]
    },
    {
        step: 3,
        label: "What is the average monthly cost for licenses, permits, and legal registrations?",
        type: "textOrNumber",
        options: ["Estimated cost: ", "Still gathering details"]
    },
    {
        step: 4,
        label: "Do you have a business bank account and/or bookkeeping software?",
        type: "textOrNumber",
        options: ["Estimated Monthly Cost: ", "I'll manage finances manually. (Note, risky for long term)"]

    },
    // Start-Up Expenses
    {
        step: 5,
        label: "How much will it cost to launch your product or service (supplies, equipment, packaging, etc.)?",
        type: "multiple",
        options: ["$0–$500", "$500–$5,000", "$5,000–$25,000", "Over $25,000"]
    },
    {
        step: 6,
        label: "Do you plan to hire staff or contractors in your first year?",
        type: "textOrNumber",
        options: ["Yes – Estimated Monthly Payroll: ", "No – I'll run things solo"]
    },
    {
        step: 7,
        label: "What technology will you need (website, POS system, domain, hosting, design, tools)?",
        type: "dualInput",
        options: ["Estimated Total for Startup:", "Ongoing Monthly:"]
    },
    // Personal Finance Impact
    {
        step: 8,
        label: "Do you have savings set aside specifically for your business?",
        type: "textOrNumber",
        options: ["Yes – Amount: ", "No"]
    },
    {
        step: 9,
        label: "How many months can you cover your personal bills while your business earns little or no income?",
        type: "multiple",
        options: ["0–6 Months", "6–12 Months", "1–2 Years", "2+ Years"]
    },
    {
        step: 10,
        label: "Are you relying on a loan or credit to start your business?",
        type: "textOrNumber",
        options: ["Yes – Amount: ", "No – Self-Funded"]
    },
    // Ongoing Costs
    {
        step: 11,
        label: "Which of the following will be recurring monthly costs for your business? (check all that apply)",
        type: "checkbox",
        options: [
            "Rent or mortgage",
            "Internet & phone",
            "Utilities",
            "Software subscriptions (QuickBooks, Canva, Shopify, etc.)",
            "Marketing/advertising",
            "Inventory restocking",
            "Loan repayment"
        ]
    },
    {
        step: 12,
        label: "Have you created a monthly budget or projected income/expenses for your first year?",
        type: "multiple",
        options: ["Yes", "No – Still working on it"]
    },
    {
        step: 13,
        label: "How much profit do you realistically expect to make in the first 12 months?",
        type: "multiple",
        options: ["None – Just breaking even", "$1–$5,000", "$5,000–$20,000", "Over $20,000"]
    },
    {
        step: 14,
        label: "Do you know your break-even point (how much you must sell to cover your costs)?",
        type: "multiple",
        options: ["Yes", "No – Still calculating"]
    },
    // Final Reflection
    {
        step: 15,
        label: "What will success look like for you in your first year?",
        type: "textarea"
    },
    {
        step: 16,
        label: "What sacrifices are you willing to make to get your business off the ground?",
        type: "multiple",
        options: [
            "Time with friends/family",
            "Reducing personal expenses",
            "Working another job on the side",
            "Delaying personal goals",
            "I’m not sure yet"
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
        // ✅ Detect any option that should have a numeric field
        if (
            optLower.includes("estimated") ||
            optLower.includes("amount") ||
            optLower.includes("cost") ||
            opt.includes(":")
        ) {
            const input = document.createElement("input");
            input.type = "number";
            input.placeholder = "$0";
            input.min = "0";
            input.step = "0.01";
            input.inputMode = "decimal";
            input.className = "inline-input";

            // ✅ Auto-select the radio if user starts typing
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
        textarea.placeholder = "Type your response here...";
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
        alert("Please answer or click Skip.");
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
        window.location.href = "/summary.html";
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