const WebSocket = require('ws');
const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>Anshub Cloud Control v0.5</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        :root { --p: #bdacff; --bg: #050505; --card: #121212; --neon: 0 0 15px #bdacff; }
        * { box-sizing: border-box; transition: 0.3s; }
        body { background: var(--bg); color: white; font-family: 'Segoe UI', sans-serif; margin: 0; overflow: hidden; }
        
        /* BẢNG KẾT NỐI */
        #login-screen { position: fixed; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: radial-gradient(circle, #1a1a1a, #050505); z-index: 100; }
        .login-box { background: var(--card); padding: 40px; border-radius: 20px; border: 1px solid var(--p); box-shadow: var(--neon); text-align: center; width: 320px; }
        
        /* UI CHÍNH */
        #main-ui { display: none; height: 100vh; grid-template-columns: 240px 1fr; }
        .sidebar { background: var(--card); border-right: 1px solid #222; padding: 20px; }
        .content { padding: 30px; overflow-y: auto; background: #080808; }
        
        /* COMPONENT */
        .tab-btn { width: 100%; padding: 12px; margin-bottom: 10px; background: transparent; border: 1px solid #333; color: white; border-radius: 8px; cursor: pointer; text-align: left; }
        .tab-btn:hover, .tab-btn.active { background: var(--p); color: black; font-weight: bold; box-shadow: var(--neon); }
        .card { background: #181818; padding: 20px; border-radius: 12px; border: 1px solid #333; margin-bottom: 20px; }
        .btn { background: var(--p); border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold; width: 100%; color: black; }
        input, textarea { width: 100%; background: #000; border: 1px solid #333; color: white; padding: 12px; border-radius: 8px; outline: none; margin-bottom: 15px; }
        input:focus { border-color: var(--p); }

        .hidden { display: none !important; }
    </style>
</head>
<body>

    <div id="login-screen">
        <div class="login-box">
            <h2 style="color:var(--p)">ANSHUB v0.5</h2>
            <p style="font-size:12px; color:#666">NHẬP TÊN NGƯỜI CHƠI TRONG GAME</p>
            <input type="text" id="username" placeholder="Tên người chơi...">
            <button class="btn" onclick="startConnect()">KẾT NỐI</button>
        </div>
    </div>

    <div id="main-ui">
        <div class="sidebar">
            <h3 style="color:var(--p)">DASHBOARD</h3>
            <button class="tab-btn active" onclick="showTab('home')">Home</button>
            <button class="tab-btn" onclick="showTab('executor')">Executor</button>
            <button class="tab-btn" onclick="showTab('setting')">Settings</button>
            <div style="margin-top: 50px;">
                <button class="btn" style="background:#ff4d4d" onclick="disconnect()">HỦY KẾT NỐI</button>
            </div>
        </div>

        <div class="content">
            <div id="tab-home" class="tab-content">
                <div class="card">
                    <h3>Thông tin người chơi: <span id="display-name" style="color:var(--p)"></span></h3>
                    <p>Trạng thái: 🟢 Đang liên kết</p>
                </div>
                <div class="card">
                    <h3>Hack Cơ Bản</h3>
                    <p>Speed: <span id="speed-val">16</span></p>
                    <input type="range" min="16" max="500" value="16" oninput="updateSpeed(this.value)">
                    <button class="btn" onclick="sendCommand('inf_jump')">Bật Infinite Jump</button>
                </div>
            </div>

            <div id="tab-executor" class="tab-content hidden">
                <div class="card">
                    <h3>Cloud Executor</h3>
                    <textarea id="code" style="height: 300px; font-family: monospace;" placeholder="-- Nhập script..."></textarea>
                    <button class="btn" onclick="executeScript()">RUN SCRIPT</button>
                </div>
            </div>

            <div id="tab-setting" class="tab-content hidden">
                <div class="card">
                    <h3>Cài Đặt</h3>
                    <button class="btn" onclick="sendCommand('rejoin')">Yêu cầu Rejoin</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const socket = new WebSocket(protocol + '//' + window.location.host);
        let currentTarget = "";

        function startConnect() {
            const name = document.getElementById('username').value;
            if(!name) return alert("Vui lòng nhập tên!");
            currentTarget = name;
            
            // Gửi tín hiệu xác thực tới game
            socket.send(JSON.stringify({target: name, action: "auth_success"}));
            
            document.getElementById('display-name').innerText = name;
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('main-ui').style.display = 'grid';
        }

        function disconnect() {
            socket.send(JSON.stringify({target: currentTarget, action: "auth_failed"}));
            document.getElementById('login-screen').style.display = 'flex';
            document.getElementById('main-ui').style.display = 'none';
        }

        function showTab(tab) {
            document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.getElementById('tab-' + tab).classList.remove('hidden');
            event.target.classList.add('active');
        }

        function updateSpeed(val) {
            document.getElementById('speed-val').innerText = val;
            sendCommand('speed', val);
        }

        function sendCommand(action, value = true) {
            socket.send(JSON.stringify({target: currentTarget, action: action, value: value}));
        }

        function executeScript() {
            const code = document.getElementById('code').value;
            sendCommand('execute', code);
        }
    </script>
</body>
</html>
    `);
});

const wss = new WebSocket.Server({ server });
wss.on('connection', (ws) => {
    ws.on('message', (data) => {
        wss.clients.forEach(c => { if(c.readyState === WebSocket.OPEN) c.send(data.toString()); });
    });
});
server.listen(process.env.PORT || 8080);
 
