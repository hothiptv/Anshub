const WebSocket = require('ws');
const http = require('http');

const server = http.createServer((req, res) => {
    res.end('Anshub Cloud Engine v0.5 is Running!');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    ws.on('message', (data) => {
        const message = data.toString();
        // Phát lệnh tới tất cả các bên (Web nhận để cập nhật UI, Roblox nhận để hack)
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
});

server.listen(process.env.PORT || 8080);
