const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// Lấy API Key từ Variables của Railway
const GROQ_API_KEY = process.env.GROQ_KEY;

app.post('/chat', async (req, res) => {
    if (!req.body.prompt) {
        return res.status(400).json({ error: "Thiếu prompt" });
    }

    try {
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama3-70b-8192",
            messages: [
                { role: "system", content: "Bạn là Anscript, trả lời cực ngắn bằng tiếng Việt." },
                { role: "user", content: req.body.prompt }
            ]
        }, {
            headers: { 
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json' 
            }
        });
        
        res.json({ message: response.data.choices[0].message.content });
    } catch (error) {
        console.error("Lỗi gọi Groq:", error.message);
        res.status(500).json({ error: "Lỗi API Groq" });
    }
});

// Quan trọng: Railway yêu cầu lắng nghe trên cổng process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server đang chạy trên port ${PORT}`);
});
