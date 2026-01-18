const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'database.json');

// Tạo database ảo nếu chưa có
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: [], projects: {} }));
}

app.use(express.json());

// QUAN TRỌNG: Chỉ định thư mục chứa file giao diện
app.use(express.static(path.join(__dirname, 'public')));

// Trả về file index.html khi vào trang chủ
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API lấy dữ liệu Script
app.get('/api/v1/fetch/:key', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DB_PATH));
    const project = data.projects[req.params.key];
    if (project) res.json(project);
    else res.status(404).json({error: "Not Found"});
});

app.listen(PORT, () => {
    console.log(`Server live at port ${PORT}`);
});
