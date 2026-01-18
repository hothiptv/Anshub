const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    let fileName = req.url === '/' ? 'index.html' : req.url.substring(1);
    fs.readFile(path.join(__dirname, fileName), (err, data) => {
        if (err) { res.writeHead(404); res.end("File Not Found"); return; }
        res.writeHead(200); res.end(data);
    });
});

const wss = new WebSocket.Server({ server });
let sessions = {}; 

wss.on('connection', (ws) => {
    console.log("Co ket noi moi!");

    ws.on('message', (data) => {
        try {
            const d = JSON.parse(data.toString());

            // GAME KHOI TAO
            if (d.type === "game_init") {
                ws.playerName = d.playerName;
                ws.isGame = true;
                if (!sessions[d.playerName]) sessions[d.playerName] = {};
                sessions[d.playerName].gameWs = ws;
                console.log("Game Online: " + d.playerName);
            }

            // ADMIN GUI YEU CAU
            if (d.type === "admin_request") {
                const target = d.target;
                if (sessions[target] && sessions[target].gameWs) {
                    sessions[target].adminWs = ws;
                    ws.targetPlayer = target;
                    sessions[target].gameWs.send(JSON.stringify({ type: "auth_request" }));
                    ws.send(JSON.stringify({ type: "waiting_auth" }));
                } else {
                    ws.send(JSON.stringify({ type: "error", msg: "Khong tim thay nhân vật này (Phải bật Script trước)!" }));
                }
            }

            // XAC NHAN TU GAME
            if (d.type === "auth_response") {
                const targetSession = sessions[ws.playerName];
                if (targetSession && targetSession.adminWs) {
                    if (d.accepted) {
                        targetSession.status = "connected";
                        targetSession.adminWs.send(JSON.stringify({ type: "connected" }));
                    } else {
                        targetSession.adminWs.send(JSON.stringify({ type: "error", msg: "Người chơi từ chối!" }));
                    }
                }
            }

            // CHUYEN TIEP DATA (HP, SPEED, LOG)
            if (d.type === "game_data" || d.type === "log") {
                const targetSession = sessions[ws.playerName];
                if (targetSession && targetSession.adminWs) {
                    targetSession.adminWs.send(data.toString());
                }
            }
            
            // ADMIN EXECUTE
            if (d.action === "execute") {
                const targetSession = sessions[ws.targetPlayer];
                if (targetSession && targetSession.gameWs) {
                    targetSession.gameWs.send(data.toString());
                }
            }

        } catch (e) { console.log("Loi: ", e); }
    });

    ws.on('close', () => {
        if (ws.isGame && sessions[ws.playerName]) {
            if (sessions[ws.playerName].adminWs) {
                sessions[ws.playerName].adminWs.send(JSON.stringify({ type: "player_offline", msg: "Offline" }));
            }
            delete sessions[ws.playerName];
        }
    });
});

server.listen(process.env.PORT || 8080);
