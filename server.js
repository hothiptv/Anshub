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
            
            // GAME ONLINE
            if (d.type === "game_init") {
                ws.playerName = d.playerName;
                ws.isGame = true;
                sessions[d.playerName] = { gameWs: ws, data: d.data, status: "pending" };
                broadcastOnlineList();
            }

            // WEB ĐÒI DANH SÁCH
            if (d.type === "get_online_list") {
                broadcastOnlineList();
            }

            // WEB KẾT NỐI
            if (d.type === "web_connect") {
                const target = d.playerName;
                if (sessions[target]) {
                    sessions[target].webWs = ws;
                    ws.playerName = target;
                    sessions[target].gameWs.send(JSON.stringify({ type: "auth_request" }));
                }
            }

            if (d.type === "auth_response" && d.accepted) {
                if (sessions[ws.playerName] && sessions[ws.playerName].webWs) {
                    sessions[ws.playerName].webWs.send(JSON.stringify({ type: "connect_success", data: sessions[ws.playerName].data }));
                }
            }

            if (d.type === "update") {
                if (sessions[ws.playerName] && sessions[ws.playerName].webWs) {
                    sessions[ws.playerName].data = d.data;
                    sessions[ws.playerName].webWs.send(JSON.stringify({ type: "ui_update", data: d.data }));
                }
            }

            if (d.type === "execute") {
                if (sessions[ws.playerName] && sessions[ws.playerName].gameWs) {
                    sessions[ws.playerName].gameWs.send(JSON.stringify({ type: "run_script", code: d.code }));
                }
            }
        } catch(e) {}
    });

    ws.on('close', () => {
        if (ws.playerName && ws.isGame) {
            delete sessions[ws.playerName];
            broadcastOnlineList();
        }
    });
});

function broadcastOnlineList() {
    const list = Object.keys(sessions);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "online_list", list: list }));
        }
    });
}

server.listen(process.env.PORT || 8080);
