const AnUI = {
    socket: null,
    init(ws) {
        this.socket = ws;
        // TỰ ĐỘNG TẠO CÁC TAB CƠ BẢN
        this.addTab("Home", "🏠");
        this.addTab("Executor", "💻");
        this.showTab("Home");
        
        // VÍ DỤ TẠO NÚT
        this.addButton("Home", "Tăng Tốc (50)", () => this.sendHack("walkspeed", 50));
        this.addButton("Home", "Reset Nhân Vật", () => this.sendHack("execute", "game.Players.LocalPlayer.Character.Humanoid.Health = 0"));
    },

    addTab(name, icon) {
        let b = document.createElement('div');
        b.innerHTML = `${icon} ${name}`;
        b.style = "padding:15px; cursor:pointer; border-radius:8px; margin-bottom:5px;";
        b.onclick = () => this.showTab(name);
        b.onmouseover = () => b.style.background = "#1a1a1a";
        b.onmouseout = () => b.style.background = "transparent";
        document.getElementById('menu').appendChild(b);

        let c = document.createElement('div');
        c.id = "tab-" + name;
        c.style.display = "none";
        document.getElementById('content').appendChild(c);
    },

    addButton(tabName, btnText, callback) {
        let btn = document.createElement('button');
        btn.innerText = btnText;
        btn.style = "background:#222; color:white; border:1px solid #333; padding:10px; margin:5px; border-radius:5px; cursor:pointer;";
        btn.onclick = callback;
        document.getElementById('tab-' + tabName).appendChild(btn);
    },

    showTab(name) {
        document.querySelectorAll('[id^="tab-"]').forEach(t => t.style.display = "none");
        document.getElementById('tab-' + name).style.display = "block";
    },

    sendHack(action, value) {
        this.socket.send(JSON.stringify({ type: "execute", action: action, value: value }));
    }
};
