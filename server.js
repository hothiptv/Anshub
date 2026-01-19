const express = require('express');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const wss = new (require('ws').Server)({ server });

app.use(express.static(__dirname));
app.use(express.json());

// Biến lưu trữ (An có thể thay bằng file JSON nếu muốn)
let db = { 
    keys: {}, 
    config: { lv_id: "2650959", timer: 24 } 
};

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'AnsW.html')));

// API Xác minh cho Script Roblox
app.get('/api/verify', (req, res) => {
    const key = req.query.key;
    if (db.keys[key] && db.keys[key].expires > Date.now()) {
        res.send("true");
    } else {
        res.send("false");
    }
});

// API Tạo key (Chỉ tạo khi người dùng hoàn thành 2 bước)
app.get('/api/generate-key', (req, res) => {
    // Tạo 1 key cố định cho mỗi phiên get key
    const newKey = "ans-" + Math.random().toString(36).substring(2, 10);
    db.keys[newKey] = { 
        expires: Date.now() + (db.config.timer * 60 * 60 * 1000),
        created: Date.now() 
    };
    res.json({ key: newKey });
});

wss.on('connection', (ws) => {
    // Gửi danh sách ngay khi Admin kết nối
    ws.send(JSON.stringify({ type: "key_list", list: db.keys }));

    ws.on('message', (msg) => {
        const d = JSON.parse(msg);
        if (d.type === "admin_get_keys") {
            ws.send(JSON.stringify({ type: "key_list", list: db.keys }));
        }
        if (d.type === "admin_delete_key") {
            delete db.keys[d.key];
            // Cập nhật lại cho tất cả admin đang mở web
            wss.clients.forEach(client => {
                client.send(JSON.stringify({ type: "key_list", list: db.keys }));
            });
        }
    });
});

server.listen(process.env.PORT || 8080);
