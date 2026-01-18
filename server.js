const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'AnsW.html')));
app.use(express.static(__dirname));

let sessions = {}; 

wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
        try {
            const d = JSON.parse(msg);
            if (d.type === "game_init") {
                ws.playerName = d.playerName;
                ws.isGame = true;
                sessions[d.playerName] = { gameWs: ws, data: d.data };
                broadcastOnlineList();
            }
            if (d.type === "web_connect") {
                const target = d.playerName;
                if (sessions[target]) {
                    sessions[target].webWs = ws;
                    ws.playerName = target;
                    sessions[target].gameWs.send(JSON.stringify({ type: "auth_request" }));
                }
            }
            if (d.type === "auth_response" && d.accepted) {
                if (sessions[ws.playerName]?.webWs) {
                    sessions[ws.playerName].webWs.send(JSON.stringify({ type: "connect_success", data: sessions[ws.playerName].data }));
                }
            }
            if (d.type === "update" && sessions[ws.playerName]?.webWs) {
                sessions[ws.playerName].data = d.data;
                sessions[ws.playerName].webWs.send(JSON.stringify({ type: "ui_update", data: d.data }));
            }
            if (d.type === "execute" && sessions[ws.playerName]?.gameWs) {
                sessions[ws.playerName].gameWs.send(JSON.stringify({ type: "run_script", code: d.code }));
            }
        } catch(e) {}
    });

    ws.on('close', () => {
        if (ws.isGame) {
            // Đợi 30 giây mới xóa để An kịp đổi Server
            setTimeout(() => {
                if (!sessions[ws.playerName]?.gameWs || sessions[ws.playerName].gameWs.readyState !== WebSocket.OPEN) {
                    delete sessions[ws.playerName];
                    broadcastOnlineList();
                }
            }, 30000);
        }
    });
});

function broadcastOnlineList() {
    const list = Object.keys(sessions);
    wss.clients.forEach(c => c.readyState === WebSocket.OPEN && c.send(JSON.stringify({ type: "online_list", list: list })));
}

server.listen(process.env.PORT || 8080);
