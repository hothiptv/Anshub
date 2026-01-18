const ADMIN_CONFIG = {
    userName: "AnScript", // THAY TÊN CỦA AN VÀO ĐÂY
    themeColor: "#bdacff"
};

const AnshubUI = {
    tabs: [
        {
            id: "home",
            name: "🏠 Home",
            content: `
                <div class="card neon-border">
                    <h3 id="game-name">Đang chờ thông tin game...</h3>
                    <div class="stat-row">❤️ Máu: <span id="hp-text">0/100</span></div>
                    <div class="hp-bg"><div id="hp-bar" class="hp-fill"></div></div>
                    <div class="stat-row">⚡ Tốc độ: <span id="speed-text">16</span></div>
                </div>
                <div class="card">
                    <h3>Trạng thái người chơi</h3>
                    <div id="player-status" class="status-msg">Đang đợi script kết nối...</div>
                </div>
            `
        },
        {
            id: "executor",
            name: "💻 Executor",
            content: `
                <div class="card neon-border">
                    <textarea id="code-box" class="code-font" placeholder="-- Write your magic here..."></textarea>
                    <button class="btn-glow" onclick="runScript()">EXECUTE</button>
                </div>
                <div id="logs" class="log-container"></div>
            `
        }
    ]
};

function initUI() {
    const menu = document.getElementById('sidebar-menu');
    const content = document.getElementById('main-content');
    menu.innerHTML = '<div class="logo">ANSHUB v0.7</div>';
    
    AnshubUI.tabs.forEach(tab => {
        let btn = document.createElement('div');
        btn.className = 'nav-btn';
        btn.innerHTML = tab.name;
        btn.onclick = () => showTab(tab.id);
        menu.appendChild(btn);
        
        let section = document.createElement('div');
        section.id = tab.id;
        section.className = 'tab-content';
        section.innerHTML = tab.content;
        content.appendChild(section);
    });
    showTab('home');
}
 
