const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());

// Đảm bảo mở đúng file AnsW.html khi vào trang chủ
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'AnsW.html'));
});

// Cho phép truy cập các file khác (như getkey.html)
app.use(express.static(__dirname));

let sessions = {};
let adminConfig = { lv_user_id: "", lv_api_key: "", timer: 24 };

// API lưu cấu hình từ Web Admin
app.post('/api/save-config', (req, res) => {
    const { userId, apiKey, timer } = req.body;
    adminConfig.lv_user_id = userId;
    adminConfig.lv_api_key = apiKey;
    adminConfig.timer = timer;
    res.json({ success: true });
});

wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
        try {
            const d = JSON.parse(msg);
            if (d.type === "game_init") {
                ws.playerName = d.playerName;
                ws.isGame = true;
                sessions[d.playerName] = { gameWs: ws, data: d.data };
                console.log("Player Online:", d.playerName);
            }
            // Các logic khác giữ nguyên...
        } catch (e) {}
    });

    ws.on('close', () => {
        if (ws.playerName) delete sessions[ws.playerName];
    });
});

// QUAN TRỌNG: Dùng PORT của Railway cấp
const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server đang chạy cực ngon tại Port: ${PORT}`);
});
