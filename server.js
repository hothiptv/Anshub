const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const DB_PATH = path.join(__dirname, 'database.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Đảm bảo có file database
if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify({ users: [], projects: {} }));

const getData = () => JSON.parse(fs.readFileSync(DB_PATH));
const saveData = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// Trang chủ
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// API Đăng ký & Đăng nhập (Gộp chung để gọn)
app.post('/api/auth', (req, res) => {
    const { user, pass, type } = req.body;
    let data = getData();
    if (type === 'register') {
        if (data.users.find(u => u.user === user)) return res.status(400).send("User tồn tại");
        data.users.push({ user, pass });
        saveData(data);
        return res.send({ success: true });
    }
    const found = data.users.find(u => u.user === user && u.pass === pass);
    res.send({ success: !!found });
});

// API Lấy/Cập nhật Project
app.get('/api/project/:key', (req, res) => {
    const project = getData().projects[req.params.key];
    project ? res.json(project) : res.status(404).send("Not Found");
});

app.post('/api/project/save', (req, res) => {
    const { key, config } = req.body;
    let data = getData();
    data.projects[key] = config;
    saveData(data);
    res.send("Saved");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Anshub Live: ${PORT}`));
