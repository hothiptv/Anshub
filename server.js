const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Bộ nhớ đệm lưu lệnh
let commands = {};

// Cấu hình để truy cập trực tiếp các file trong thư mục gốc
app.use(express.static(__dirname));

// API gửi lệnh từ Web
app.get('/api/send', (req, res) => {
    const { user, cmd, x, y } = req.query;
    if (!user) return res.status(400).send("No user");
    
    commands[user] = {
        cmd: cmd || "idle",
        x: parseFloat(x) || 0,
        y: parseFloat(y) || 0,
        time: Date.now()
    };
    res.send("OK");
});

// API cho Roblox lấy lệnh (Link Node.js kết nối game)
app.get('/api/get-command', (req, res) => {
    const user = req.query.user;
    if (commands[user]) {
        res.json(commands[user]);
        // Reset lệnh dùng 1 lần
        if (["jump", "esc", "tab", "zoom_in", "zoom_out"].includes(commands[user].cmd)) {
            commands[user].cmd = "idle";
        }
    } else {
        res.json({ cmd: "idle", x: 0, y: 0 });
    }
});

// Route chính để hiện giao diện Web
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server đang chạy tại: https://anshub-production.up.railway.app`);
});
