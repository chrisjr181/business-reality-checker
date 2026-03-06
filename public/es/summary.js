async function fetchSummary() {
    const sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
        alert("No session found. Please start over.");
        window.location.href = "/form.html";
        return;
    }

    try {
        const res = await fetch(`/get-summary/${sessionId}`);
        const data = await res.json();

        if (data.error) {
            alert("Session not found.");
            return;
        }

        const answersDiv = document.getElementById("answers");
        const recommendationsList = document.getElementById("recommendations");

        const totalSteps = 16;
        let skippedCount = 0;

        // Render all answers
        const questionLabels = [
            "What kind of business are you starting?",
            "Will you need a physical location?",
            "What is the average monthly cost for licenses, permits, and legal registrations?",
            "Do you have a business bank account and/or bookkeeping software?",
            "How much will it cost to launch your product or service (supplies, equipment, packaging, etc.)?",
            "Do you plan to hire staff or contractors in your first year?",
            "What technology will you need (website, POS system, domain, hosting, design, tools)?",
            "Do you have savings set aside specifically for your business?",
            "How many months can you cover your personal bills while your business earns little or no income?",
            "Are you relying on a loan or credit to start your business?",
            "Which of the following will be recurring monthly costs for your business? (check all that apply)",
            "Have you created a monthly budget or projected income/expenses for your first year?",
            "How much profit do you realistically expect to make in the first 12 months?",
            "Do you know your break-even point (how much you must sell to cover your costs)?",
            "What will success look like for you in your first year?",
            "What sacrifices are you willing to make to get your business off the ground?"
        ];

        for (let i = 1; i <= totalSteps; i++) {
            const qData = data.answers[i] || "";
            const p = document.createElement("p");
            if (!qData || qData.trim() === "") {
                p.innerHTML = `<strong>${questionLabels[i - 1]}:</strong> <span class="skipped">(Skipped)</span>`;
            } else {
                p.innerHTML = `<strong>${questionLabels[i - 1]}:</strong> ${qData}`;
            }
            answersDiv.appendChild(p);
        }


        // Custom Logic Recommendations
        const recs = [];

        // 1. Too many skipped
        if (skippedCount >= 3) {
            recs.push("You skipped 3 or more questions. Consider revisiting skipped areas for a more accurate readiness check.");
        }

        // 2. License/permit costs (Step 3)
        const licenseAnswer = data.answers[3] || "";
        if (licenseAnswer.toLowerCase().includes("no")) {
            recs.push("You need to research license, permits, and legal registration costs for your state/county.");
        }

        // 3. Financial Planning (Steps 4, 6, 7)
        const bankAnswer = data.answers[4] || "";
        const payrollAnswer = data.answers[6] || "";
        const techAnswer = data.answers[7] || "";

        if (bankAnswer.includes("No")) {
            recs.push("Setting up a proper business bank account and bookkeeping software is highly recommended.");
        }
        if (payrollAnswer.includes("Yes") && !payrollAnswer.match(/\d/)) {
            recs.push("You plan to hire staff but didn’t provide payroll estimates. Add realistic payroll costs.");
        }
        if (!techAnswer.match(/\d/)) {
            recs.push("You did not provide estimated technology costs. Research hosting, domain, or POS system fees.");
        }

        // 4. Personal Financial Runway (Step 8)
        const runway = data.answers[8] || "";
        if (runway.includes("0 months")) {
            recs.push("You have no personal financial runway. Consider savings or a side income before launching.");
        } else if (runway.includes("1–3 months")) {
            recs.push("You have a short runway (1–3 months). Ensure your business can generate income quickly.");
        }

        // 5. Savings or Loan (Steps 9, 10)
        const savings = data.answers[9] || "";
        const loan = data.answers[10] || "";
        if (savings.includes("No") && loan.includes("No")) {
            recs.push("You have no savings or funding plan. Research funding options to cover startup costs.");
        }

        // 6. Recurring Costs (Step 11)
        const recurring = data.answers[11] || "";
        if (!recurring) {
            recs.push("You didn’t select recurring monthly costs. Identify and plan for ongoing expenses.");
        }

        // 7. Budget and Profit (Steps 12, 13)
        const budget = data.answers[12] || "";
        const profit = data.answers[13] || "";
        if (budget.includes("No")) {
            recs.push("You need to create a monthly budget or income/expense projection for the first year.");
        }
        if (profit.includes("Over $20,000") && (runway.includes("0") || savings.includes("No"))) {
            recs.push("Your profit expectations seem high. Re-check your assumptions against realistic data.");
        }

        // 8. Break-even Point (Step 14)
        const breakeven = data.answers[14] || "";
        if (breakeven.includes("No")) {
            recs.push("You need to calculate your break-even point (how much you must sell to cover costs).");
        }

        // Display recommendations
        if (recs.length > 0) {
            recs.forEach(msg => {
                const li = document.createElement("li");
                li.textContent = msg;
                recommendationsList.appendChild(li);
            });
        } else {
            const li = document.createElement("li");
            li.textContent = "✅ All answers look great. You're ready to move forward!";
            recommendationsList.appendChild(li);
        }
    } catch (err) {
        console.error("Error fetching summary:", err);
        alert("Could not load summary.");
    }
}

function restart() {
    const sessionId = sessionStorage.getItem('sessionId');
    if (sessionId) {
        fetch(`/end-session/${sessionId}`, { method: "DELETE" });
        sessionStorage.removeItem('sessionId');
    }
    window.location.href = "/form.html";
}

document.addEventListener("DOMContentLoaded", fetchSummary);

// PDF Download
(function wirePdfButtonOnce() {
    const btn = document.getElementById("download-pdf");
    if (!btn || btn.dataset.bound === "1") return;
    btn.dataset.bound = "1";
    btn.addEventListener("click", generatePDF);
})();

async function generatePDF(e) {
    e?.preventDefault?.();

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt", "a4");

    // Clone the content so we can strip UI without changing the live page
    const live = document.querySelector(".container");
    const clone = live.cloneNode(true);

    // Remove buttons and anything tagged for exclusion
    clone.querySelectorAll(".nav-buttons, #download-pdf, [data-pdf-exclude]")
        .forEach(el => el.remove());

    // Optional: ensure white background
    clone.style.background = "#ffffff";

    await doc.html(clone, {
        x: 20,
        y: 20,
        width: 550,
        windowWidth: 800,
        // Safety: ignore elements if any slipped through
        html2canvas: {
            ignoreElements: el => el?.classList?.contains("nav-buttons") || el?.closest?.(".nav-buttons")
        },
        callback(pdf) {
            pdf.save("BusinessRealitySummary.pdf");
        }
    });
}

