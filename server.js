const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Tên thư mục chứa HTML của bạn
const FOLDER_NAME = 'boxl';

// Cấu hình để server nhận diện thư mục boxl
app.use(express.static(path.join(__dirname, FOLDER_NAME)));

// ROUTING: Điều hướng người dùng
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, FOLDER_NAME, 'user.html'));
});

app.get('/ai-master', (req, res) => {
    res.sendFile(path.join(__dirname, FOLDER_NAME, 'ai.html'));
});

// QUẢN LÝ LOGIC KẾT NỐI
let waitingUsers = []; 
let activeConnections = {}; 

io.on('connection', (socket) => {
    console.log('Kết nối mới:', socket.id);

    // 1. Khi khách vào và nhập tên
    socket.on('guest_join', (username) => {
        socket.username = username;
        waitingUsers.push({ id: socket.id, name: username });
        io.emit('update_waiting_list', waitingUsers);
    });

    // 2. Khi AI (bạn) chọn kết nối với 1 khách
    socket.on('ai_connect_user', (userId) => {
        activeConnections[socket.id] = userId;
        activeConnections[userId] = socket.id;
        
        // Thông báo khách đã kết nối
        io.to(userId).emit('connected_to_ai');
        
        // Xóa khỏi danh sách chờ
        waitingUsers = waitingUsers.filter(u => u.id !== userId);
        io.emit('update_waiting_list', waitingUsers);
    });

    // 3. Xử lý tin nhắn (Chế độ nhắn tin luân phiên do HTML điều khiển)
    socket.on('send_message', (data) => {
        const targetId = activeConnections[socket.id];
        if (targetId) {
            io.to(targetId).emit('receive_message', data);
        }
    });

    // 4. TÍNH NĂNG MỚI: AI NHÌN THẤY KHÁCH ĐANG GÕ (Real-time Typing)
    socket.on('typing_status', (text) => {
        const targetId = activeConnections[socket.id];
        if (targetId) {
            // Gửi nội dung đang gõ sang cho bộ AI
            io.to(targetId).emit('guest_typing_preview', text);
        }
    });

    // 5. TÍNH NĂNG MỚI: KHÁCH THẤY AI ĐANG SOẠN (Chỉ hiện thông báo)
    socket.on('ai_typing_status', (isTyping) => {
        const targetId = activeConnections[socket.id];
        if (targetId) {
            io.to(targetId).emit('ai_is_typing', isTyping);
        }
    });

    // 6. Các tính năng quản trị khác
    socket.on('change_ai_name', (newName) => {
        const targetId = activeConnections[socket.id];
        if (targetId) io.to(targetId).emit('update_ai_name', newName);
    });

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

    // 7. Khi ngắt kết nối (tắt tab hoặc mất mạng)
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

// Cổng chạy server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server đang chạy mượt mà tại cổng: ${PORT}`);
});
