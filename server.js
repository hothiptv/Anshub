const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const DB_PATH = './database.json';

// Khởi tạo database nếu chưa có
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: [], projects: {} }));
}

function getData() { return JSON.parse(fs.readFileSync(DB_PATH)); }
function saveData(data) { fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)); }

// --- API AUTH ---
app.post('/api/auth/register', (req, res) => {
    const { user, pass } = req.body;
    let data = getData();
    if (data.users.find(u => u.user === user)) return res.status(400).send("User đã tồn tại");
    data.users.push({ user, pass });
    saveData(data);
    res.send({ success: true });
});

app.post('/api/auth/login', (req, res) => {
    const { user, pass } = req.body;
    let data = getData();
    const found = data.users.find(u => u.user === user && u.pass === pass);
    if (found) res.send({ success: true });
    else res.status(401).send("Sai tài khoản hoặc mật khẩu");
});

// --- API PROJECT ---
app.post('/api/project/create', (req, res) => {
    const { name, owner } = req.body;
    const apiKey = "ans-" + uuidv4().substring(0, 8);
    let data = getData();
    data.projects[apiKey] = {
        name: name,
        owner: owner,
        settings: { title: name, author: owner, transparent: false, accent: "#00f2ff", icon: "" },
        tabs: [],
        keySystem: { enabled: false, keys: "", type: "direct" }
    };
    saveData(data);
    res.send({ apiKey });
});

app.get('/api/v1/fetch/:apiKey', (req, res) => {
    const data = getData();
    const project = data.projects[req.params.apiKey];
    if (project) res.json(project);
    else res.status(404).send("API Not Found");
});

app.post('/api/project/update', (req, res) => {
    const { apiKey, config } = req.body;
    let data = getData();
    if (data.projects[apiKey]) {
        data.projects[apiKey] = config;
        saveData(data);
        res.send("Updated");
    }
});

app.listen(process.env.PORT || 3000, () => console.log("Server is running..."));
