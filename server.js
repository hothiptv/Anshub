const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    let fileName = req.url === '/' ? 'index.html' : req.url.substring(1);
    let filePath = path.join(__dirname, fileName);
    fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end("File Not Found"); return; }
        let type = fileName.endsWith('.js') ? 'text/javascript' : 'text/html';
        res.writeHead(200, { 'Content-Type': type });
        res.end(data);
    });
});

const wss = new WebSocket.Server({ server });
let sessions = {}; 

function makeID() { return "ANS-" + Math.random().toString(36).substr(2, 5).toUpperCase(); }

wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
        const d = JSON.parse(msg.toString());

        if (d.type === "game_init") {
            ws.playerName = d.playerName;
            sessions[d.playerName] = { gameWs: ws, status: "idle" };
            console.log("Game Online: " + d.playerName);
        }

        if (d.type === "admin_request") {
            const session = sessions[d.target];
            if (session && session.gameWs) {
                const vID = makeID();
                session.adminWs = ws;
                session.vID = vID;
                ws.target = d.target;
                ws.send(JSON.stringify({ type: "waiting_auth", vID: vID }));
                session.gameWs.send(JSON.stringify({ type: "auth_prompt", vID: vID }));
            } else {
                ws.send(JSON.stringify({ type: "error", msg: "Người chơi chưa bật script!" }));
            }
        }

        if (d.type === "auth_response") {
            const session = sessions[ws.playerName];
            if (session && session.adminWs && d.accepted) {
                session.status = "connected";
                session.adminWs.send(JSON.stringify({ type: "connected" }));
            }
        }

        // Chuyển tiếp lệnh Hack/Data
        if (d.type === "execute" || d.type === "game_data") {
            const targetWs = d.type === "execute" ? sessions[ws.target]?.gameWs : sessions[ws.playerName]?.adminWs;
            if (targetWs) targetWs.send(msg.toString());
        }
    });

    ws.on('close', () => {
        if (ws.playerName) delete sessions[ws.playerName];
    });
});

server.listen(process.env.PORT || 8080);
