const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Đảm bảo server có thể đọc được các file trong thư mục public
app.use(express.static(path.join(__dirname, 'public')));

// 1. ĐỊNH TUYẾN (ROUTING)
// Link cho Hành khách: https://ten-app.up.railway.app/
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'user.html'));
});

// Link cho bạn (AI): https://ten-app.up.railway.app/ai-master
app.get('/ai-master', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ai.html'));
});

// 2. QUẢN LÝ LOGIC CHAT
let waitingUsers = []; 
let activeConnections = {}; 

io.on('connection', (socket) => {
    console.log('Kết nối mới:', socket.id);

    // Khi khách vào web và gửi tên
    socket.on('guest_join', (username) => {
        socket.username = username;
        waitingUsers.push({ id: socket.id, name: username });
        // Gửi danh sách chờ mới nhất cho tất cả các trang AI
        io.emit('update_waiting_list', waitingUsers);
    });

    // Khi bạn (AI) nhấn nút "Kết nối" với một khách
    socket.on('ai_connect_user', (userId) => {
        activeConnections[socket.id] = userId;
        activeConnections[userId] = socket.id;

        // Báo cho khách biết AI đã vào cuộc
        io.to(userId).emit('connected_to_ai');

        // Xóa người này khỏi danh sách chờ
        waitingUsers = waitingUsers.filter(u => u.id !== userId);
        io.emit('update_waiting_list', waitingUsers);
    });

    // Chuyển tin nhắn qua lại giữa 2 bên
    socket.on('send_message', (data) => {
        const targetId = activeConnections[socket.id];
        if (targetId) {
            io.to(targetId).emit('receive_message', data);
        }
    });

    // Bạn (AI) đổi tên hiển thị để troll
    socket.on('change_ai_name', (newName) => {
        const targetId = activeConnections[socket.id];
        if (targetId) {
            io.to(targetId).emit('update_ai_name', newName);
        }
    });

    // Bạn (AI) xóa sạch tin nhắn bên máy khách
    socket.on('clear_chat_request', () => {
        const targetId = activeConnections[socket.id];
        if (targetId) {
            io.to(targetId).emit('clear_chat');
        }
    });

    // Ngắt kết nối và đưa cả 2 về trang chờ
    socket.on('disconnect_request', () => {
        const targetId = activeConnections[socket.id];
        if (targetId) {
            io.to(targetId).emit('force_disconnect');
            delete activeConnections[targetId];
        }
        delete activeConnections[socket.id];
    });

    // Xử lý khi ai đó tắt tab trình duyệt
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

// KHỞI CHẠY SERVER
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
});
