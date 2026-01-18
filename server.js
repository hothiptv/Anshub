const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(__dirname));

// Fix lỗi treo khi Railway gửi yêu cầu kiểm tra server
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'AnsW.html'));
});

let sessions = {}; 

wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
        try {
            const d = JSON.parse(msg);
            
            if (d.type === "game_init") {
                // Nếu tên cũ đã tồn tại, xóa để ghi đè cái mới (Fix lỗi "Đang ở menu")
                if (sessions[d.playerName]) {
                    delete sessions[d.playerName];
                }
                ws.playerName = d.playerName;
                ws.isGame = true;
                sessions[d.playerName] = { gameWs: ws, data: d.data };
                broadcastOnlineList();
                console.log(`Game Connected: ${d.playerName}`);
            }

            if (d.type === "web_connect") {
                const target = d.playerName;
                if (sessions[target]) {
                    sessions[target].webWs = ws;
                    ws.playerName = target;
                    // Gửi yêu cầu xác nhận xuống Roblox
                    if (sessions[target].gameWs.readyState === WebSocket.OPEN) {
                        sessions[target].gameWs.send(JSON.stringify({ type: "auth_request" }));
                    }
                }
            }

            if (d.type === "auth_response" && d.accepted) {
                if (sessions[ws.playerName] && sessions[ws.playerName].webWs) {
                    sessions[ws.playerName].webWs.send(JSON.stringify({ 
                        type: "connect_success", 
                        data: sessions[ws.playerName].data 
                    }));
                }
            }

            if (d.type === "execute" && sessions[ws.playerName]?.gameWs) {
                sessions[ws.playerName].gameWs.send(JSON.stringify({ type: "run_script", code: d.code }));
            }

            if (d.type === "update" && sessions[ws.playerName]?.webWs) {
                sessions[ws.playerName].data = d.data;
                sessions[ws.playerName].webWs.send(JSON.stringify({ type: "ui_update", data: d.data }));
            }

            if (d.type === "get_online_list") {
                broadcastOnlineList();
            }

        } catch (e) {
            console.log("Lỗi xử lý tin nhắn: ", e);
        }
    });

    ws.on('close', () => {
        if (ws.isGame && ws.playerName) {
            console.log(`Game Disconnected: ${ws.playerName}`);
            delete sessions[ws.playerName];
            broadcastOnlineList();
        }
    });
});

function broadcastOnlineList() {
    const list = Object.keys(sessions);
    const data = JSON.stringify({ type: "online_list", list: list });
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

// Lắng nghe port của Railway
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server đang chạy tại port: ${PORT}`);
});
