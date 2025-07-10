async function fetchSummary() {
    const sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
        alert("No session found. Please start over.");
        window.location.href = "/form.html";
        return;
    }

    const res = await fetch(`/get-summary/${sessionId}`);
    const data = await res.json();

    if (data.error) {
        alert("Session not found.");
        return;
    }

    const answersDiv = document.getElementById("answers");
    const recommendationsList = document.getElementById("recommendations");

    // Render answers
    Object.entries(data.answers).forEach(([step, answer]) => {
        const item = document.createElement("p");
        item.innerHTML = `<strong>Step ${step}:</strong> ${answer}`;
        answersDiv.appendChild(item);
    });

    // Render feedback
    if (data.feedback.length > 0) {
        data.feedback.forEach(msg => {
            const li = document.createElement("li");
            li.textContent = msg;
            recommendationsList.appendChild(li);
        });
    } else {
        const li = document.createElement("li");
        li.textContent = "✅ All sections completed. Great job!";
        recommendationsList.appendChild(li);
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