const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let waitingPlayer = null; // Máy A đang chờ
let rooms = {}; // Lưu trữ các trận đấu đang diễn ra

io.on('connection', (socket) => {
    socket.on('join', (name) => {
        socket.playerName = name;
        if (!waitingPlayer) {
            waitingPlayer = socket;
            socket.emit('status', 'Đang chờ người chơi B...');
        } else {
            // Ghép đôi A và B
            const roomName = `room_${waitingPlayer.id}_${socket.id}`;
            const playerA = waitingPlayer;
            const playerB = socket;
            
            playerA.join(roomName);
            playerB.join(roomName);

            rooms[roomName] = {
                players: [playerA.id, playerB.id],
                names: { [playerA.id]: playerA.playerName, [playerB.id]: playerB.playerName },
                bombs: {}, // Lưu vị trí kẹo nổ mỗi người chọn
                grid: 32, // 8x4
                turn: playerA.id // A chọn trước
            };

            io.to(roomName).emit('start', { 
                room: roomName, 
                opponent: playerB.playerName, 
                firstTurn: playerA.id 
            });
            waitingPlayer = null;
        }
    });

    // Khi người chơi chọn kẹo nổ bí mật của mình
    socket.on('select_bomb', ({ room, index }) => {
        if (rooms[room]) {
            rooms[room].bombs[socket.id] = index;
            // Nếu cả 2 đã chọn kẹo nổ xong
            if (Object.keys(rooms[room].bombs).length === 2) {
                io.to(room).emit('phase_eat', "Cả hai đã chọn xong! Bắt đầu ăn kẹo.");
            }
        }
    });

    socket.on('disconnect', () => { if (waitingPlayer === socket) waitingPlayer = null; });
});

server.listen(process.env.PORT || 3000, () => console.log("Game Server Running"));
