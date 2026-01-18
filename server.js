const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Cấu hình để khi truy cập link gốc sẽ mở AnsW.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'AnsW.html'));
});

// Cho phép truy cập các file khác như bo.js, bog.css
app.use(express.static(__dirname));

let sessions = {}; 

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        try {
            const d = JSON.parse(message);
            
            if (d.type === "game_init") {
                const id = "ANS-" + Math.random().toString(36).substr(2, 5).toUpperCase();
                ws.ansID = id;
                sessions[id] = { gameWs: ws, data: d.data };
                ws.send(JSON.stringify({ type: "assigned_id", id: id }));
            }

            if (d.type === "web_connect") {
                if (sessions[d.id]) {
                    sessions[d.id].webWs = ws;
                    ws.ansID = d.id;
                    ws.send(JSON.stringify({ type: "connect_success", data: sessions[d.id].data }));
                } else {
                    ws.send(JSON.stringify({ type: "error", msg: "ID không tồn tại!" }));
                }
            }

            if (d.type === "execute") {
                const session = sessions[ws.ansID];
                if (session && session.gameWs) {
                    session.gameWs.send(JSON.stringify({ type: "run_script", code: d.code }));
                }
            }
        } catch (e) { console.log(e); }
    });

    ws.on('close', () => {
        if (ws.ansID) delete sessions[ws.ansID];
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
