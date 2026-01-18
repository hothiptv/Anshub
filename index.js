const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    // Tự động tìm file index.html nếu vào trang chủ
    let fileName = req.url === '/' ? 'index.html' : req.url.substring(1);
    let filePath = path.join(__dirname, fileName);
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end("Khong tim thay file: " + fileName);
            return;
        }
        // Xác định kiểu file để trình duyệt đọc đúng
        let contentType = "text/html";
        if (fileName.endsWith(".js")) contentType = "text/javascript";
        if (fileName.endsWith(".css")) contentType = "text/css";
        
        res.writeHead(200, { 'Content-Type': contentType + '; charset=utf-8' });
        res.end(data);
    });
});

const wss = new WebSocket.Server({ server });

let currentAdmin = null;
let currentGame = null; // Đã sửa từ nil thành null

wss.on('connection', (ws) => {
    ws.on('message', (data) => {
        try {
            const d = JSON.parse(data.toString());

            if (d.type === "admin_connect") {
                if (currentAdmin && currentAdmin.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: "error", msg: "Admin khác đang dùng!" }));
                } else {
                    currentAdmin = ws;
                    ws.send(JSON.stringify({ type: "connected" }));
                    if (currentGame) currentGame.send(JSON.stringify({ action: "admin_online" }));
                }
            }

            if (ws === currentAdmin && currentGame) {
                currentGame.send(data.toString());
            }

            if (d.type === "game_data" || d.type === "log") {
                currentGame = ws;
                if (currentAdmin) currentAdmin.send(data.toString());
            }
        } catch (e) {
            console.log("Lỗi xử lý dữ liệu:", e);
        }
    });

    ws.on('close', () => {
        if (ws === currentAdmin) {
            currentAdmin = null;
            if (currentGame) currentGame.send(JSON.stringify({ action: "admin_offline" }));
        }
        if (ws === currentGame) currentGame = null;
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log("Server dang chay tai cong: " + PORT);
});
 
