const AnshubUI = {
    tabs: [
        {
            id: "home",
            name: "🏠 Home",
            content: `
                <div class="card">
                    <h3>Nhân vật của An</h3>
                    <div class="stat-row">❤️ Máu: <span id="hp-text">100/100</span></div>
                    <div class="hp-bg"><div id="hp-bar" class="hp-fill" style="width: 100%;"></div></div>
                    <div class="stat-row">⚡ Tốc độ: <span id="speed-text">16</span></div>
                </div>
                <div class="card">
                    <h3>Người chơi trong Server</h3>
                    <div id="player-list" class="list-container"> Đang quét danh sách... </div>
                </div>
            `
        },
        {
            id: "executor",
            name: "💻 Executor",
            content: `
                <div class="card">
                    <h3>Cloud Executor v0.6</h3>
                    <textarea id="code-box" placeholder="-- Dán script của bạn vào đây..."></textarea>
                    <div style="display:flex; gap:10px;">
                        <button class="btn-p" onclick="runScript()">RUN SCRIPT</button>
                        <button class="btn-p" style="background:#444" onclick="document.getElementById('code-box').value=''">CLEAR</button>
                    </div>
                </div>
                <div class="card">
                    <h3>Nhật ký hệ thống (Logs)</h3>
                    <div id="logs" class="log-container"></div>
                    <button class="btn-p" style="font-size:10px; padding:5px;" onclick="document.getElementById('logs').innerHTML=''">Xóa Log</button>
                </div>
            `
        },
        {
            id: "settings",
            name: "⚙️ Settings",
            content: `
                <div class="card">
                    <h3>Hệ thống</h3>
                    <button class="btn-p" onclick="send('rejoin', true)">Rejoin Server</button>
                    <button class="btn-p" onclick="send('hop', true)">Server Hop</button>
                    <button class="btn-p" style="background:#ff4d4d" onclick="disconnect()">Hủy kết nối & Đóng Web</button>
                </div>
            `
        }
    ]
};

// Hàm tự động vẽ Menu và Tab
function initUI() {
    const menu = document.getElementById('sidebar-menu');
    const content = document.getElementById('main-content');
    
    AnshubUI.tabs.forEach(tab => {
        // Tạo nút Menu
        let btn = document.createElement('div');
        btn.className = 'nav-btn';
        btn.innerHTML = tab.name;
        btn.onclick = () => showTab(tab.id);
        menu.appendChild(btn);
        
        // Tạo nội dung Tab
        let section = document.createElement('div');
        section.id = tab.id;
        section.className = 'tab-content';
        section.innerHTML = tab.content;
        content.appendChild(section);
    });
    showTab('home'); // Mặc định mở tab Home
}

function showTab(id) {
    document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
    document.getElementById(id).style.display = 'block';
}

function runScript() {
    const code = document.getElementById('code-box').value;
    send('execute', code);
}
