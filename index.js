const WebSocket = require('ws');
const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    
    // GIAO DIỆN WEB ANSCRIPT HUB V0.5
    res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>Anscript Hub v0.5 | Cloud Control</title>
    <style>
        :root { --p: #bdacff; --bg: #050505; --card: #121212; --neon: 0 0 10px #bdacff; }
        body { background: var(--bg); color: white; font-family: 'Segoe UI', sans-serif; margin: 0; display: flex; height: 100vh; }
        
        .sidebar { width: 260px; background: var(--card); border-right: 1px solid #222; display: flex; flex-direction: column; box-shadow: 2px 0 15px rgba(0,0,0,0.5); }
        .logo { padding: 30px; font-weight: bold; font-size: 22px; color: var(--p); text-shadow: var(--neon); letter-spacing: 2px; text-align: center; }
        
        .main { flex: 1; display: flex; flex-direction: column; background: radial-gradient(circle at top right, #111, #050505); }
        .header { padding: 20px 40px; background: rgba(0,0,0,0.5); display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #222; }
        
        .content { padding: 30px; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        
        .card { background: #181818; border-radius: 12px; padding: 20px; border: 1px solid #333; transition: 0.3s; }
        .card:hover { border-color: var(--p); box-shadow: var(--neon); }
        .card h3 { margin: 0 0 15px 0; font-size: 16px; color: var(--p); border-bottom: 1px solid #333; padding-bottom: 10px; }

        .btn { background: var(--p); border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold; width: 100%; margin-top: 10px; transition: 0.2s; color: black; }
        .btn:hover { transform: translateY(-2px); opacity: 0.9; }

        input[type="text"], textarea { width: 100%; background: #000; border: 1px solid #333; color: white; padding: 12px; border-radius: 8px; outline: none; box-sizing: border-box; }
        input[type="text"]:focus { border-color: var(--p); }

        .status-badge { padding: 5px 12px; border-radius: 20px; font-size: 12px; background: #222; border: 1px solid #444; }
    </style>
</head>
<body>
    <div class="sidebar">
        <div class="logo">ANSHUB v0.5</div>
        <div style="padding: 20px; font-size: 13px; color: #666; text-align:center;">Cloud External Control</div>
    </div>

    <div class="main">
        <div class="header">
            <div class="status-badge" id="status">🔴 OFFLINE</div>
            <input type="text" id="target" placeholder="Nhập tên người chơi..." style="width: 250px; margin: 0;">
        </div>

        <div class="content">
            <div class="card">
                <h3>Người chơi (v0.5)</h3>
                <p style="font-size: 13px;">Tốc độ chạy</p>
                <input type="range" min="16" max="500" value="16" style="width:100%" oninput="send('speed', this.value)">
                <button class="btn" onclick="send('inf_jump', true)">Infinite Jump</button>
                <button class="btn" onclick="send('noclip', true)">Noclip</button>
            </div>

            <div class="card" style="grid-column: span 2;">
                <h3>Executor Cloud</h3>
                <textarea id="code" style="height: 150px; font-family: monospace;" placeholder="-- Nhập script vào đây..."></textarea>
                <button class="btn" style="background: #00ff88;" onclick="send('execute', document.getElementById('code').value)">RUN SCRIPT ON ROBLOX</button>
            </div>
        </div>
    </div>

    <script>
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const socket = new WebSocket(protocol + '//' + window.location.host);
        
        socket.onopen = () => {
            const st = document.getElementById('status');
            st.innerText = "🟢 SERVER ONLINE";
            st.style.color = "#00ff88";
            st.style.borderColor = "#00ff88";
        };

        function send(action, value) {
            const name = document.getElementById('target').value;
            if(!name) return alert("An ơi! Phải nhập tên người chơi đã!");
            
            const data = JSON.stringify({ target: name, action: action, value: value });
            socket.send(data);
        }
    </script>
</body>
</html>
    `);
});

// XỬ LÝ DỮ LIỆU WEBSOCKET
const wss = new WebSocket.Server({ server });
wss.on('connection', (ws) => {
    ws.on('message', (data) => {
        const message = data.toString();
        // Gửi lệnh cho tất cả các máy khách kết nối (bao gồm game Roblox)
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
});

server.listen(process.env.PORT || 8080);
