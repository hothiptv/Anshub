const socket = io();
let currentAuthId = "";

function connectPlayer() {
    const name = document.getElementById('target-player').value;
    if (!name) return alert("Vui lòng nhập tên!");
    
    document.getElementById('status-msg').innerText = "Đang tìm kiếm người chơi...";
    socket.emit('find-player', name);
}

socket.on('waiting-approval', (data) => {
    currentAuthId = data.authId;
    document.getElementById('display-id').innerText = data.authId;
    document.getElementById('modal-auth').style.display = 'flex';
});

socket.on('connect-success', () => {
    document.getElementById('modal-auth').style.display = 'none';
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('main-ui').style.display = 'flex';
    // Khởi tạo các tab mặc định
    initDefaultTabs();
});

socket.on('error-msg', (msg) => {
    alert(msg);
    document.getElementById('status-msg').innerText = "";
});
