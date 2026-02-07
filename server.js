const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Cấu hình thư mục chứa file HTML (public)
app.use(express.static(path.join(__dirname, 'public')));

// CÁC ĐƯỜNG DẪN (ROUTING)
// Truy cập link gốc (/) sẽ vào bộ hành khách
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'user.html'));
});

// Truy cập (/ai-master) sẽ vào bộ điều khiển AI
app.get('/ai-master', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ai.html'));
});

// QUẢN LÝ KẾT NỐI REAL-TIME
let waitingUsers = []; 
let activeConnections = {}; 

io.on('connection', (socket) => {
    console.log('Có người vừa truy cập:', socket.id);

    // 1. Hành khách tham gia và nhập tên
    socket.on('guest_join', (username) => {
        socket.username = username;
        waitingUsers.push({ id: socket.id, name: username });
        // Cập nhật danh sách cho tất cả các trang AI đang mở
        io.emit('update_waiting_list', waitingUsers);
    });

    // 2. AI chọn một khách hàng từ danh sách để "troll"
    socket.on('ai_connect_user', (userId) => {
        activeConnections[socket.id] = userId;
        activeConnections[userId] = socket.id;

        // Báo cho khách biết là AI đã online
        io.to(userId).emit('connected_to_ai');

        // Xóa khách này khỏi danh sách chờ
        waitingUsers = waitingUsers.filter(u => u.id !== userId);
        io.emit('update_waiting_list', waitingUsers);
        console.log(`AI ${socket.id} đã kết nối với Khách ${userId}`);
    });

    // 3. Xử lý gửi tin nhắn qua lại
    socket.on('send_message', (data) => {
        const targetId = activeConnections[socket.id];
        if (targetId) {
            io.to(targetId).emit('receive_message', data);
        }
    });

    // 4. AI đổi tên hiển thị (ví dụ: ChatGPT, Simsimi...)
    socket.on('change_ai_name', (newName) => {
        const targetId = activeConnections[socket.id];
        if (targetId) {
            io.to(targetId).emit('update_ai_name', newName);
        }
    });

    // 5. AI ra lệnh xóa hết tin nhắn ở màn hình khách
    socket.on('clear_chat_request', () => {
        const targetId = activeConnections[socket.id];
        if (targetId) {
            io.to(targetId).emit('clear_chat');
        }
    });

    // 6. Ngắt kết nối (Về bảng chờ)
    socket.on('disconnect_request', () => {
        const targetId = activeConnections[socket.id];
        if (targetId) {
            io.to(targetId).emit('force_disconnect');
            delete activeConnections[targetId];
        }
        delete activeConnections[socket.id];
    });

    // 7. Khi một trong hai bên tắt trình duyệt
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

// Khởi chạy Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});
