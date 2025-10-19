const { v4: uuidv4 } = require('uuid');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Temporary in-memory data store (session-based)
let sessionData = {};

// Receive form submission from each page
app.post('/save-answer', (req, res) => {
    const { sessionId, step, answer } = req.body;

    if (!sessionData[sessionId]) sessionData[sessionId] = {};
    sessionData[sessionId][step] = answer;

    res.json({ status: 'ok' });
});

// Final summary and feedback
app.get('/get-summary/:sessionId', (req, res) => {
    const data = sessionData[req.params.sessionId];
    if (!data) return res.status(404).json({ error: 'Session not found' });

    // Basic feedback: check for blank fields
    const feedback = [];
    const totalSteps = 15; // adjust later based on real question count
    for (let i = 1; i <= totalSteps; i++) {
        if (!data[i]) feedback.push(`Step ${i} was skipped or incomplete.`);
    }

    res.json({ answers: data, feedback });
});

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
app.get('/new-session', (req, res) => {
    const sessionId = uuidv4();
    sessionData[sessionId] = {}; // initialize empty session storage
    res.json({ sessionId });
});