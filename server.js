const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(__dirname));

// Cơ sở dữ liệu tạm thời (Nên dùng file JSON để lưu khi restart server)
let db = {
    keys: {}, 
    config: { lv_id: "123456", lv_key: "", timer: 24 }
};

wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
        try {
            const d = JSON.parse(msg);
            
            // ADMIN: Lấy danh sách key
            if (d.type === "admin_get_keys") {
                ws.send(JSON.stringify({ type: "key_list", list: db.keys }));
            }

            // ADMIN: Xóa Key (Làm key hết hạn ngay lập tức)
            if (d.type === "admin_delete_key") {
                delete db.keys[d.key];
                broadcastKeys();
            }

            // SCRIPT: Xác minh Key từ Roblox
            if (d.type === "verify_key") {
                const info = db.keys[d.key];
                if (info && info.expires > Date.now()) {
                    ws.send(JSON.stringify({ type: "key_valid", success: true }));
                } else {
                    ws.send(JSON.stringify({ type: "key_valid", success: false, msg: "Key hết hạn hoặc không tồn tại!" }));
                }
            }
        } catch (e) {}
    });
});

// API cho trang Get Key
app.get('/api/generate-key', (req, res) => {
    const newKey = "ans-" + Math.random().toString(36).substring(2, 12);
    const expireTime = Date.now() + (db.config.timer * 60 * 60 * 1000);
    db.keys[newKey] = { expires: expireTime, created: Date.now() };
    res.json({ key: newKey });
});

function broadcastKeys() {
    wss.clients.forEach(c => c.readyState === WebSocket.OPEN && c.send(JSON.stringify({ type: "key_list", list: db.keys })));
}

server.listen(process.env.PORT || 8080);
