import { createServer } from 'http';

// 🔑 PASTE YOUR GROQ API KEY INSIDE THE QUOTES BELOW:
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const server = createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/api/draft') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const { name, company, lastInteraction, status } = JSON.parse(body);

                // Call the Free Groq API using the standard format
                const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${GROQ_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: 'llama-3.3-70b-versatile', // Incredibly fast and completely free
                        messages: [
                            { role: 'system', content: 'You are an elite sales assistant. Write concise, professional B2B follow-up emails.' },
                            { role: 'user', content: `Draft a short follow-up email to ${name} from ${company}. Last interaction: "${lastInteraction}". Deal status: ${status}. Keep it under 100 words.` }
                        ]
                    })
                });

                const aiData = await groqResponse.json();
                
                if (aiData.error) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ draft: `Groq Error: ${aiData.error.message}` }));
                    return;
                }

                const aiDraft = aiData.choices[0].message.content;

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ draft: aiDraft }));

            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ draft: "Backend server error. Check your API key." }));
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 AI Backend engine is running perfectly on port ${PORT}`);
});S
