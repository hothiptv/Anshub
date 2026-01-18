const WebSocket = require('ws');
const http = require('http');

const server = http.createServer((req, res) => { res.end('Anscript Cloud Engine'); });
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    ws.on('message', (data) => {
        // Phát tán lệnh JSON tới mọi client (Roblox sẽ tự check tên mình)
        const rawData = data.toString();
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(rawData);
            }
        });
    });
});

server.listen(process.env.PORT || 8080);
 
