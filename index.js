const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    // Đọc file index.html hoặc tab.js để trả về trình duyệt
    let filePath = req.url === '/' ? 'index.html' : req.url.substring(1);
    
    fs.readFile(path.join(__dirname, filePath), (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end("Không tìm thấy file!");
            return;
        }
        res.writeHead(200);
        res.end(data);
    });
});

const wss = new WebSocket.Server({ server });

let currentAdmin = null;
let currentGame = nil;

wss.on('connection', (ws) => {
    ws.on('message', (data) => {
        const d = JSON.parse(data.toString());

        // Khi Admin bấm nút "Kết nối" trên Web
        if (d.type === "admin_connect") {
            if (currentAdmin && currentAdmin.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: "error", msg: "Cảnh báo: Admin khác đang sử dụng!" }));
            } else {
                currentAdmin = ws;
                ws.send(JSON.stringify({ type: "connected" }));
                if (currentGame) currentGame.send(JSON.stringify({ action: "admin_online" }));
            }
        }

        // Luồng dữ liệu: Admin -> Game
        if (ws === currentAdmin && currentGame) {
            currentGame.send(data.toString());
        }

        // Luồng dữ liệu: Game -> Admin (HP, Speed, Logs)
        if (d.type === "game_data" || d.type === "log") {
            currentGame = ws;
            if (currentAdmin) currentAdmin.send(data.toString());
        }
    });

    ws.on('close', () => {
        if (ws === currentAdmin) {
            currentAdmin = null;
            if (currentGame) currentGame.send(JSON.stringify({ action: "admin_offline" }));
        }
    });
});

server.listen(process.env.PORT || 8080);
 
