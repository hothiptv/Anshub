const socket = io();

function connectToGame() {
    const id = document.getElementById('ans-id-input').value;
    socket.emit('web_connect', id);
}

socket.on('connect_success', (data) => {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('main-ui').style.display = 'grid';
    initHome(data);
});

// Hàm tạo nút kiểu An muốn
function addRemoteButton(tabId, name, code) {
    const btn = document.createElement('button');
    btn.className = 'ans-btn';
    btn.innerText = name;
    btn.onclick = () => {
        socket.emit('web_command', { type: 'execute', value: code });
    };
    document.getElementById(tabId).appendChild(btn);
}

// Cấu hình Tab Home
function initHome(data) {
    const home = document.getElementById('tab-home');
    home.innerHTML = `
        <div class="khung">
            <h3>CHỈ SỐ</h3>
            <p>👤 Tên: <span id="p-name">${data.name}</span></p>
            <p>❤️ HP: <span id="p-hp">${data.hp}</span></p>
            <p>⚡ Tốc độ: <span id="p-ws">${data.ws}</span></p>
            <p>🎮 Game: ${data.game}</p>
        </div>
    `;
}
