const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let players = {}; // Lưu trữ kết nối

io.on('connection', (socket) => {
    // Khi Script trong game kết nối
    socket.on('register-player', (playerName) => {
        players[playerName] = { socketId: socket.id, status: 'waiting' };
        console.log(`Player ${playerName} is waiting...`);
    });

    // Web tìm kiếm người chơi
    socket.on('find-player', (targetName) => {
        if (players[targetName]) {
            const authId = "ans-" + Math.random().toString(36).substring(2, 7);
            io.to(players[targetName].socketId).emit('request-auth', { authId, webSocketId: socket.id });
            socket.emit('waiting-approval', { authId });
        } else {
            socket.emit('error-msg', 'Không tìm thấy người chơi này đang bật script!');
        }
    });

    // Xác nhận từ game
    socket.on('auth-confirm', (data) => {
        io.to(data.webSocketId).emit('connect-success', data);
    });

    // Truyền dữ liệu UI (vitals, logs, v.v.)
    socket.on('update-stats', (data) => {
        io.emit('stats-to-web', data);
    });

    socket.on('disconnect', () => {
        // Xóa player khỏi danh sách nếu mất kết nối
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
