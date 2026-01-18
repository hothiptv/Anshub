const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();

// 1. Cấu hình để Express có thể đọc file trong thư mục 'public'
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// 2. Định tuyến cho trang chủ (Sửa lỗi Cannot GET /)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Database & API (Giữ nguyên logic cũ) ---
const DB_PATH = './database.json';
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: [], projects: {} }));
}

// ... (Các API auth và project khác bạn đã viết) ...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server Anshub đang chạy tại port: ${PORT}`);
});
