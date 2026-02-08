const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// Lấy API Key từ môi trường (Environment Variable) để bảo mật
const GROQ_API_KEY = process.env.GROQ_KEY;

app.post('/chat', async (req, res) => {
    try {
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama3-70b-8192",
            messages: [
                { role: "system", content: "Bạn là Anscript, trả lời cực ngắn, toxic nhẹ và hài hước trong Roblox bằng tiếng Việt." },
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
        res.status(500).json({ error: "Lỗi kết nối Groq qua Railway" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server chạy trên port ${PORT}`));
