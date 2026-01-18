const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    let fileName = req.url === '/' ? 'index.html' : req.url.substring(1);
    fs.readFile(path.join(__dirname, fileName), (err, data) => {
        if (err) { res.writeHead(404); res.end("Not Found"); return; }
        res.writeHead(200); res.end(data);
    });
});

const wss = new WebSocket.Server({ server });

let sessions = {}; // Lưu trữ: { playerName: { adminWs, gameWs, status: "pending/connected" } }

wss.on('connection', (ws) => {
    ws.on('message', (data) => {
        const d = JSON.parse(data.toString());

        // 1. GAME KẾT NỐI (Khi bật script)
        if (d.type === "game_init") {
            if (!sessions[d.playerName]) sessions[d.playerName] = {};
            sessions[d.playerName].gameWs = ws;
            ws.playerName = d.playerName;
            // Nếu có admin đang đợi hoặc đã kết nối trước đó, báo cho game
            if (sessions[d.playerName].status === "connected") {
                ws.send(JSON.stringify({ action: "admin_online" }));
            }
        }

        // 2. WEB GỬI YÊU CẦU KẾT NỐI
        if (d.type === "admin_request") {
            const target = d.target;
            if (sessions[target] && sessions[target].gameWs) {
                sessions[target].adminWs = ws;
                sessions[target].status = "pending";
                sessions[target].gameWs.send(JSON.stringify({ type: "auth_request" }));
                ws.send(JSON.stringify({ type: "waiting_auth" }));
            } else {
                ws.send(JSON.stringify({ type: "error", msg: "Người chơi này hiện đang Offline!" }));
            }
        }

        // 3. GAME CHẤP NHẬN/TỪ CHỐI
        if (d.type === "auth_response") {
            const admin = sessions[ws.playerName].adminWs;
            if (d.accepted) {
                sessions[ws.playerName].status = "connected";
                if (admin) admin.send(JSON.stringify({ type: "connected" }));
            } else {
                sessions[ws.playerName].status = null;
                if (admin) admin.send(JSON.stringify({ type: "error", msg: "Người chơi đã từ chối kết nối!" }));
            }
        }

        // 4. CHUYỂN TIẾP LỆNH HACK (Chỉ khi status === "connected")
        if (sessions[ws.playerName] && sessions[ws.playerName].status === "connected") {
            // Chuyển tiếp từ Web xuống Game và ngược lại
        }
    });

    ws.on('close', () => {
        if (ws.playerName && sessions[ws.playerName]) {
            if (ws === sessions[ws.playerName].gameWs) {
                if (sessions[ws.playerName].adminWs) {
                    sessions[ws.playerName].adminWs.send(JSON.stringify({ type: "player_offline" }));
                }
            }
        }
    });
});

server.listen(process.env.PORT || 8080);
