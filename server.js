const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(__dirname));

let sessions = {}; // Lưu: { id: { gameWs, webWs, data } }

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const d = JSON.parse(message);

        // Game khởi tạo
        if (d.type === "game_init") {
            const id = "ANS-" + Math.random().toString(36).substr(2, 5).toUpperCase();
            ws.ansID = id;
            sessions[id] = { gameWs: ws, data: d.data };
            ws.send(JSON.stringify({ type: "assigned_id", id: id }));
            console.log("Game Online: " + id);
        }

        // Web kết nối
        if (d.type === "web_connect") {
            if (sessions[d.id]) {
                sessions[d.id].webWs = ws;
                ws.ansID = d.id;
                ws.send(JSON.stringify({ type: "connect_success", data: sessions[d.id].data }));
            } else {
                ws.send(JSON.stringify({ type: "error", msg: "ID không tồn tại!" }));
            }
        }

        // Chuyển tiếp lệnh từ Web xuống Game
        if (d.type === "execute") {
            const session = sessions[ws.ansID];
            if (session && session.gameWs) {
                session.gameWs.send(JSON.stringify({ type: "run_script", code: d.code }));
            }
        }

        // Cập nhật dữ liệu từ Game lên Web
        if (d.type === "update") {
            const session = sessions[ws.ansID];
            if (session && session.webWs) {
                session.webWs.send(JSON.stringify({ type: "ui_update", data: d.data }));
            }
        }
    });

    ws.on('close', () => {
        if (ws.ansID) delete sessions[ws.ansID];
    });
});

server.listen(process.env.PORT || 8080, () => {
    console.log("Server đang chạy tại: https://anshub-production.up.railway.app/");
});
