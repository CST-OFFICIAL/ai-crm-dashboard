const express = require('express');
const app = express();

app.use(express.json());

// Main AI API Endpoint
app.post('/api/draft', async (req, res) => {
    const { name, company, notes } = req.body;
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
        return res.status(500).json({ error: "Missing GROQ_API_KEY on the server." });
    }

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "user",
                        content: `Write a short, professional sales follow-up email to ${name} at ${company}. Context: ${notes}. Keep it concise.`
                    }
                ]
            })
        });

        const data = await response.json();
        const emailText = data.choices[0].message.content;
        res.json({ email: emailText });
    } catch (error) {
        res.status(500).json({ error: "Failed to connect to Groq API." });
    }
});

// Expose Express for Vercel Serverless Architecture
module.exports = app;
