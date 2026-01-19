const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Dòng này cực kỳ quan trọng để sửa lỗi "Cannot GET"
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'AnsW.html'));
});

// Phục vụ các file khác nếu có (như getkey.html)
app.use(express.static(__dirname));

let sessions = {}; 
let db = { keys: {}, config: { lv_id: "123456", timer: 24 } };

wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
        try {
            const d = JSON.parse(msg);
            
            // Xử lý game kết nối
            if (d.type === "game_init") {
                if (sessions[d.playerName]) delete sessions[d.playerName];
                ws.playerName = d.playerName;
                ws.isGame = true;
                sessions[d.playerName] = { gameWs: ws, data: d.data };
                broadcastOnlineList();
            }

            // Admin lấy danh sách Key
            if (d.type === "admin_get_keys") {
                ws.send(JSON.stringify({ type: "key_list", list: db.keys }));
            }

            // Admin xóa Key
            if (d.type === "admin_delete_key") {
                delete db.keys[d.key];
                broadcastKeys();
            }

            // Thêm các logic update dashboard ở đây...
            
        } catch (e) { console.log(e); }
    });

    ws.on('close', () => {
        if (ws.isGame) {
            delete sessions[ws.playerName];
            broadcastOnlineList();
        }
    });
});

function broadcastOnlineList() {
    const list = Object.keys(sessions);
    wss.clients.forEach(c => c.send(JSON.stringify({ type: "online_list", list: list })));
}

function broadcastKeys() {
    wss.clients.forEach(c => c.send(JSON.stringify({ type: "key_list", list: db.keys })));
}

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
});
 
