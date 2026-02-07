const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

let waitingUsers = []; 
let activeConnections = {}; 

io.on('connection', (socket) => {
    // Hành khách tham gia
    socket.on('guest_join', (username) => {
        socket.username = username;
        waitingUsers.push({ id: socket.id, name: username });
        io.emit('update_waiting_list', waitingUsers);
    });

    // AI chọn kết nối với khách
    socket.on('ai_connect_user', (userId) => {
        activeConnections[socket.id] = userId;
        activeConnections[userId] = socket.id;
        io.to(userId).emit('connected_to_ai');
        waitingUsers = waitingUsers.filter(u => u.id !== userId);
        io.emit('update_waiting_list', waitingUsers);
    });

    // Chuyển tiếp tin nhắn
    socket.on('send_message', (data) => {
        const targetId = activeConnections[socket.id];
        if (targetId) io.to(targetId).emit('receive_message', data);
    });

    // AI đổi tên hiển thị
    socket.on('change_ai_name', (newName) => {
        const targetId = activeConnections[socket.id];
        if (targetId) io.to(targetId).emit('update_ai_name', newName);
    });

    // Xóa tin nhắn & Ngắt kết nối
    socket.on('clear_chat_request', () => {
        const targetId = activeConnections[socket.id];
        if (targetId) io.to(targetId).emit('clear_chat');
    });

    socket.on('disconnect_request', () => {
        const targetId = activeConnections[socket.id];
        if (targetId) {
            io.to(targetId).emit('force_disconnect');
            delete activeConnections[targetId];
        }
        delete activeConnections[socket.id];
    });

    socket.on('disconnect', () => {
        waitingUsers = waitingUsers.filter(u => u.id !== socket.id);
        io.emit('update_waiting_list', waitingUsers);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
