const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

app.use(express.static('public')); // Để chạy file HTML

let players = {}; 
let rooms = {};

io.on('connection', (socket) => {
    socket.on('join', (name) => {
        players[socket.id] = { name, room: null };
        
        // Tìm phòng đang chờ
        let roomID = Object.keys(rooms).find(id => rooms[id].p2 === null);
        
        if (!roomID) {
            roomID = socket.id;
            rooms[roomID] = { p1: socket.id, p2: null, bombs: {}, turn: null, grid: 32 };
            socket.join(roomID);
            socket.emit('waiting', "Đang chờ người chơi B kết nối...");
        } else {
            rooms[roomID].p2 = socket.id;
            socket.join(roomID);
            io.to(roomID).emit('start', { 
                p1: players[rooms[roomID].p1].name, 
                p2: name,
                roomID: roomID
            });
        }
    });

    socket.on('setBomb', ({ roomID, index }) => {
        const room = rooms[roomID];
        room.bombs[socket.id] = index;
        if (Object.keys(room.bombs).length === 2) {
            room.turn = room.p1; // Người A đi trước
            io.to(roomID).emit('playPhase', { turn: room.turn });
        }
    });

    socket.on('eat', ({ roomID, index }) => {
        const room = rooms[roomID];
        const opponentID = socket.id === room.p1 ? room.p2 : room.p1;
        
        if (index === room.bombs[opponentID]) {
            io.to(roomID).emit('gameOver', { loser: players[socket.id].name });
            delete rooms[roomID]; // Reset phòng
        } else {
            room.turn = opponentID;
            io.to(roomID).emit('nextTurn', { turn: room.turn, ateIndex: index });
        }
    });
});

http.listen(process.env.PORT || 3000);
