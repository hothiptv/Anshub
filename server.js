const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Bộ nhớ đệm lưu lệnh của người chơi
let statusStore = {};

app.use(express.static(path.join(__dirname)));

// API để Web gửi lệnh di chuyển/xoay cam
app.get('/api/send', (req, res) => {
    const { user, cmd, x, y } = req.query;
    if (!user) return res.send("Missing User");
    
    statusStore[user] = {
        cmd: cmd || "idle",
        x: parseFloat(x) || 0,
        y: parseFloat(y) || 0,
        timestamp: Date.now()
    };
    res.send("Updated");
});

// API để Script Roblox lấy lệnh về máy
app.get('/api/get-command', (req, res) => {
    const user = req.query.user;
    const data = statusStore[user] || { cmd: "idle", x: 0, y: 0 };
    res.json(data);
    
    // Nếu là lệnh dùng 1 lần (Jump, Esc) thì reset ngay
    if (["jump", "esc", "tab"].includes(data.cmd)) {
        statusStore[user] = { cmd: "idle", x: 0, y: 0 };
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
