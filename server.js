const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

let connections = {}; // Lưu trữ: { id: { gameSocket, webSocket, data } }

io.on('connection', (socket) => {
    // Game khởi tạo và nhận ID
    socket.on('game_init', (data) => {
        const ansID = "ANS-" + Math.random().toString(36).substr(2, 5).toUpperCase();
        socket.ansID = ansID;
        connections[ansID] = { gameSocket: socket, data: data };
        socket.emit('assigned_id', ansID);
    });

    // Web kết nối bằng ID
    socket.on('web_connect', (id) => {
        if (connections[id]) {
            connections[id].webSocket = socket;
            socket.ansID = id;
            socket.emit('connect_success', connections[id].data);
        } else {
            socket.emit('connect_error', 'ID không tồn tại hoặc đã offline!');
        }
    });

    // Cập nhật dữ liệu từ Game lên Web
    socket.on('update_from_game', (data) => {
        const session = connections[socket.ansID];
        if (session && session.webSocket) {
            session.data = data;
            session.webSocket.emit('update_ui', data);
        }
    });

    // Gửi lệnh từ Web xuống Game (Executor, Cam, v.v.)
    socket.on('web_command', (cmd) => {
        const session = connections[socket.ansID];
        if (session && session.gameSocket) {
            session.gameSocket.emit('execute_game', cmd);
        }
    });

    socket.on('disconnect', () => {
        if (socket.ansID && connections[socket.ansID]) {
            delete connections[socket.ansID];
        }
    });
});

server.listen(process.env.PORT || 8080);
