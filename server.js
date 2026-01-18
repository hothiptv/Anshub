const express = require('express');
const path = require('path');
const app = express();

// Dòng này cực kỳ quan trọng:
app.use(express.static(path.join(__dirname, 'public')));

// Đảm bảo khi vào "/" nó sẽ gửi file index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Các logic socket.io bên dưới giữ nguyên...
