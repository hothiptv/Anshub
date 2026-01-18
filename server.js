const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'AnsW.html')));
app.use(express.static(__dirname));

let sessions = {}; // { playerName: { gameWs, webWs, data, status: "pending" | "connected" } }

wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
        try {
            const d = JSON.parse(msg);

            // GAME KHỞI TẠO
            if (d.type === "game_init") {
                ws.playerName = d.playerName;
                if (!sessions[d.playerName]) sessions[d.playerName] = {};
                sessions[d.playerName].gameWs = ws;
                sessions[d.playerName].data = d.data;
                console.log(`Game online: ${d.playerName}`);
            }

            // WEB YÊU CẦU KẾT NỐI THEO TÊN
            if (d.type === "web_connect") {
                const target = d.playerName;
                ws.playerName = target; // Gán tên cho web socket

                if (sessions[target] && sessions[target].gameWs) {
                    sessions[target].webWs = ws;
                    
                    if (sessions[target].status === "connected") {
                        // Nếu đã xác minh trước đó, cho vào luôn
                        ws.send(JSON.stringify({ type: "connect_success", data: sessions[target].data }));
                    } else {
                        // Gửi yêu cầu xác nhận xuống Game
                        ws.send(JSON.stringify({ type: "waiting_accept" }));
                        sessions[target].gameWs.send(JSON.stringify({ type: "auth_request" }));
                    }
                } else {
                    ws.send(JSON.stringify({ type: "error", msg: "Người chơi này không online!" }));
                }
            }

            // GAME CHẤP NHẬN KẾT NỐI
            if (d.type === "auth_response" && d.accepted) {
                const session = sessions[ws.playerName];
                if (session && session.webWs) {
                    session.status = "connected";
                    session.webWs.send(JSON.stringify({ type: "connect_success", data: session.data }));
                }
            }

            // ĐIỀU KHIỂN & CẬP NHẬT (Giữ nguyên logic cũ)
            if (d.type === "execute" && sessions[ws.playerName]?.gameWs) {
                sessions[ws.playerName].gameWs.send(JSON.stringify({ type: "run_script", code: d.code }));
            }
            if (d.type === "update" && sessions[ws.playerName]?.webWs) {
                sessions[ws.playerName].data = d.data;
                sessions[ws.playerName].webWs.send(JSON.stringify({ type: "ui_update", data: d.data }));
            }

        } catch(e) {}
    });

    ws.on('close', () => {
        // Không xóa ngay session để chờ tải lại trang, chỉ xóa socket tương ứng
    });
});

server.listen(process.env.PORT || 8080);
