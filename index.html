<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Anscript Hub v0.5 | External Panel</title>
    <style>
        :root { --p: #bdacff; --bg: #050505; --card: #121212; }
        body { background: var(--bg); color: white; font-family: 'Segoe UI', sans-serif; margin: 0; display: flex; height: 100vh; }
        
        /* Sidebar */
        .sidebar { width: 250px; background: var(--card); border-right: 1px solid #222; display: flex; flex-direction: column; }
        .logo { padding: 30px; font-weight: bold; font-size: 20px; color: var(--p); text-shadow: 0 0 10px var(--p); border-bottom: 1px solid #222; }
        .nav-item { padding: 15px 30px; cursor: pointer; transition: 0.3s; border-left: 3px solid transparent; }
        .nav-item:hover, .nav-item.active { background: #1a1a1a; border-left: 3px solid var(--p); color: var(--p); }

        /* Main Content */
        .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .header { padding: 20px 40px; background: #0a0a0a; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #222; }
        .status-dot { width: 10px; height: 10px; background: #ff4d4d; border-radius: 50%; display: inline-block; margin-right: 10px; }

        .content { padding: 40px; overflow-y: auto; flex: 1; display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }

        /* Components */
        .card { background: var(--card); border-radius: 12px; padding: 20px; border: 1px solid #222; transition: 0.3s; }
        .card:hover { border-color: var(--p); }
        .card h3 { margin-top: 0; font-size: 16px; color: var(--p); }

        .btn { background: var(--p); border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; width: 100%; margin-top: 10px; }
        .toggle { position: relative; display: inline-block; width: 45px; height: 24px; }
        .toggle input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #333; transition: .4s; border-radius: 24px; }
        .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .slider { background-color: var(--p); }
        input:checked + .slider:before { transform: translateX(21px); }

        /* Executor Tab */
        textarea { width: 100%; height: 200px; background: #000; color: #00ff00; border: 1px solid #333; border-radius: 8px; font-family: monospace; padding: 10px; box-sizing: border-box; resize: none; }
    </style>
</head>
<body>
    <div class="sidebar">
        <div class="logo">ANSCRIPT v0.5</div>
        <div class="nav-item active">Main Hacks</div>
        <div class="nav-item">Executor</div>
        <div class="nav-item">File Manager</div>
        <div class="nav-item">Support Chat</div>
        <div class="nav-item">Settings</div>
    </div>

    <div class="main">
        <div class="header">
            <div>
                <span id="dot" class="status-dot"></span>
                <span id="status-text">Disconnected</span>
            </div>
            <input type="text" id="targetPlayer" placeholder="Target Player Name..." style="background:#111; border:1px solid #333; color:white; padding:8px 15px; border-radius:20px; outline:none;">
        </div>

        <div class="content" id="main-hacks">
            <div class="card">
                <h3>Movement</h3>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span>Speed Hack</span>
                    <label class="toggle"><input type="checkbox" onchange="sendCommand('speed', this.checked)"><span class="slider"></span></label>
                </div>
                <input type="range" min="16" max="500" value="16" style="width:100%; margin-top:15px;" oninput="sendCommand('speed_val', this.value)">
            </div>

            <div class="card">
                <h3>Combat</h3>
                <button class="btn" onclick="sendCommand('kill_all', true)">Kill All (Risky)</button>
                <button class="btn" style="background:#333; color:white;" onclick="sendCommand('tp_spawn', true)">TP to Spawn</button>
            </div>

            <div class="card" style="grid-column: span 2;">
                <h3>Cloud Executor</h3>
                <textarea id="exe-code" placeholder="-- Paste your script here..."></textarea>
                <div style="display:flex; gap:10px; margin-top:10px;">
                    <button class="btn" onclick="sendCommand('execute', document.getElementById('exe-code').value)">Run Script</button>
                    <button class="btn" style="background:#444; color:white;" onclick="document.getElementById('exe-code').value=''">Clear</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        const socket = new WebSocket("wss://anscript-production.up.railway.app");
        const dot = document.getElementById('dot');
        const statusText = document.getElementById('status-text');

        socket.onopen = () => {
            dot.style.background = "#00ff88";
            statusText.innerText = "Connected to Railway";
        };

        function sendCommand(action, value) {
            const player = document.getElementById('targetPlayer').value;
            if(!player) return alert("Please enter Player Name first!");

            const data = {
                target: player,
                action: action,
                value: value,
                timestamp: Date.now()
            };
            socket.send(JSON.stringify(data));
        }
    </script>
</body>
</html>
