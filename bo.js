let socket = new WebSocket("wss://anshub-production.up.railway.app/");

function connectToGame() {
    const id = document.getElementById('ans-id-input').value.toUpperCase();
    socket.send(JSON.stringify({ type: "web_connect", id: id }));
}

socket.onmessage = (event) => {
    const d = JSON.parse(event.data);
    if (d.type === "connect_success") {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('main-ui').style.display = 'grid';
        updateStats(d.data);
    }
    if (d.type === "ui_update") {
        updateStats(d.data);
    }
};

// Hàm thực thi script từ xa
function runScript(url) {
    const code = `loadstring(game:HttpGet('${url}'))()`;
    socket.send(JSON.stringify({ type: "execute", code: code }));
}

function updateStats(data) {
    document.getElementById('p-name').innerText = data.name || "N/A";
    document.getElementById('p-hp').innerText = Math.floor(data.hp || 0) + "/100";
    document.getElementById('p-ws').innerText = data.ws || 16;
}
