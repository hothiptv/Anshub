const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(express.static(__dirname));

let db = { 
    keys: {}, 
    config: { lv_id: "2650959", api_key: "8e902ba7c0333745760a4589b7470f37a5e778b32eb72c9e058e69329f786ca0" } 
};

// Sửa lỗi "Cannot GET /"
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'AnsW.html')));

// API lấy link Get Key (Sửa lỗi lặp Step)
app.get('/api/get-link', (req, res) => {
    const step = req.query.step || "1";
    const domain = `https://${req.get('host')}`;
    let target = step === "1" ? `${domain}/getkey.html?step=2` : `${domain}/getkey.html?step=done`;
    res.json({ url: `https://link-to.net/${db.config.lv_id}/${Math.random().toString(36).substring(7)}/dynamic?r=${Buffer.from(target).toString('base64')}` });
});

// API xác nhận Key cho Script Roblox
app.get('/api/verify', (req, res) => {
    const key = req.query.key;
    if (db.keys[key] && db.keys[key].expires > Date.now()) {
        res.send("true");
    } else {
        res.send("false");
    }
});

// API tạo Key sau khi hoàn thành checkpoint
app.get('/api/generate-key', (req, res) => {
    const newKey = "ans-" + Math.random().toString(36).substring(2, 10);
    db.keys[newKey] = { expires: Date.now() + 86400000, created: Date.now() };
    res.json({ key: newKey });
});

wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
        const d = JSON.parse(msg);
        if (d.type === "admin_get_keys") ws.send(JSON.stringify({ type: "key_list", list: db.keys }));
        if (d.type === "admin_delete_key") { delete db.keys[d.key]; }
    });
});

server.listen(process.env.PORT || 8080, '0.0.0.0');
