// Tìm đoạn wss.on('connection', (ws) => { ... }) và cập nhật phần game_init
if (d.type === "game_init") {
    // Nếu tên này đã tồn tại, đóng kết nối cũ trước khi tạo mới
    if (sessions[d.playerName]) {
        console.log(`Phát hiện ${d.playerName} vào lại, đang dọn dẹp session cũ...`);
        if (sessions[d.playerName].gameWs) sessions[d.playerName].gameWs.close();
    }
    
    ws.playerName = d.playerName;
    ws.isGame = true;
    sessions[d.playerName] = { gameWs: ws, data: d.data };
    
    // Nếu có Web đang chờ, báo cho Web biết là đã vào game lại
    if (sessions[d.playerName].webWs) {
        ws.send(JSON.stringify({ type: "auth_request" }));
    }
    broadcastOnlineList();
}
