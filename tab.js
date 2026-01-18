const AnshubUI = {
    tabs: [
        {
            id: "home",
            name: "🏠 Home",
            content: `
                <div class="card neon-border">
                    <h3 id="game-name">Đang đợi script...</h3>
                    <div class="stat-row">👤 Người chơi: <span id="rbx-name" style="color:var(--p)">Chưa rõ</span></div>
                    <div class="stat-row">❤️ Máu: <span id="hp-text">0/100</span></div>
                    <div class="hp-bg"><div id="hp-bar" class="hp-fill"></div></div>
                    <div class="stat-row">⚡ Tốc độ: <span id="speed-text">16</span></div>
                </div>
            `
        },
        // ... các tab khác giữ nguyên
    ]
};

// Hàm này sẽ chạy khi Web nhận được dữ liệu từ Roblox
function updateHomeData(data) {
    document.getElementById('rbx-name').innerText = data.playerName;
    document.getElementById('game-name').innerText = "🎮 Game: " + data.gameName;
    document.getElementById('hp-bar').style.width = data.hp + "%";
    document.getElementById('hp-text').innerText = Math.floor(data.hp) + "/" + Math.floor(data.maxHp);
    document.getElementById('speed-text').innerText = data.speed;
}
