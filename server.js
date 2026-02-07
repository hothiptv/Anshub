const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Chỉ định thư mục chứa file web là 'boxl'
const folderName = 'boxl';
app.use(express.static(path.join(__dirname, folderName)));

// Điều hướng link trang chủ -> Hành khách
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, folderName, 'user.html'));
});

// Điều hướng link /ai-master -> Bộ điều khiển AI
app.get('/ai-master', (req, res) => {
    res.sendFile(path.join(__dirname, folderName, 'ai.html'));
});

// --- LOGIC XỬ LÝ CHAT ---
let waitingUsers = []; 
let activeConnections = {}; 

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Khi khách vào và nhập tên
    socket.on('guest_join', (username) => {
        socket.username = username;
        waitingUsers.push({ id: socket.id, name: username });
        io.emit('update_waiting_list', waitingUsers);
    });

    // Khi bạn (AI) chọn kết nối với 1 người
    socket.on('ai_connect_user', (userId) => {
        activeConnections[socket.id] = userId;
        activeConnections[userId] = socket.id;
        
        io.to(userId).emit('connected_to_ai');
        
        waitingUsers = waitingUsers.filter(u => u.id !== userId);
        io.emit('update_waiting_list', waitingUsers);
    });

    // Chuyển tiếp tin nhắn giữa AI và Khách
    socket.on('send_message', (data) => {
        const targetId = activeConnections[socket.id];
        if (targetId) {
            io.to(targetId).emit('receive_message', data);
        }
    });

    // AI đổi tên hiển thị bên khách
    socket.on('change_ai_name', (newName) => {
        const targetId = activeConnections[socket.id];
        if (targetId) {
            io.to(targetId).emit('update_ai_name', newName);
        }
    });

    // AI ra lệnh xóa chat bên khách
    socket.on('clear_chat_request', () => {
        const targetId = activeConnections[socket.id];
        if (targetId) io.to(targetId).emit('clear_chat');
    });

    // Ngắt kết nối và quay lại bảng chờ
    socket.on('disconnect_request', () => {
        const targetId = activeConnections[socket.id];
        if (targetId) {
            io.to(targetId).emit('force_disconnect');
            delete activeConnections[targetId];
        }
        delete activeConnections[socket.id];
    });

    // Khi có người tắt trình duyệt
    socket.on('disconnect', () => {
        const targetId = activeConnections[socket.id];
        if (targetId) {
            io.to(targetId).emit('force_disconnect');
            delete activeConnections[targetId];
        }
        waitingUsers = waitingUsers.filter(u => u.id !== socket.id);
        io.emit('update_waiting_list', waitingUsers);
        delete activeConnections[socket.id];
    });
});

// Chạy server trên port của Railway hoặc 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
});
