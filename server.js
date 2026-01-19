const express = require('express');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const wss = new (require('ws').Server)({ server });

app.use(express.json());

// Dòng này cực kỳ quan trọng: Nó cho phép truy cập tất cả file .html, .css trong thư mục
app.use(express.static(__dirname));

let db = { 
    keys: {}, 
    config: { lv_id: "2650959", timer: 24 } 
};

// Route cho trang Admin
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'AnsW.html'));
});

// Route cho trang Get Key (Fix lỗi không tìm thấy file)
app.get('/getkey.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'getkey.html'));
});

// API Tạo link Linkvertise động
app.get('/api/get-link', (req, res) => {
    const step = req.query.step || "1";
    const domain = `https://${req.get('host')}`;
    let target = (step === "1") ? `${domain}/getkey.html?step=2` : `${domain}/getkey.html?step=done`;
    
    // Tạo link Linkvertise
    const lv_url = `https://link-to.net/${db.config.lv_id}/${Math.random().toString(36).substring(7)}/dynamic?r=${Buffer.from(target).toString('base64')}`;
    res.json({ url: lv_url });
});

// API Xác minh cho Script Roblox
app.get('/api/verify', (req, res) => {
    const key = req.query.key;
    if (db.keys[key] && db.keys[key].expires > Date.now()) {
        res.send("true");
    } else {
        res.send("false");
    }
});

// API Tạo key
app.get('/api/generate-key', (req, res) => {
    const newKey = "ans-" + Math.random().toString(36).substring(2, 10);
    db.keys[newKey] = { 
        expires: Date.now() + (db.config.timer * 60 * 60 * 1000),
        created: Date.now() 
    };
    res.json({ key: newKey });
});

// WebSocket cho Admin
wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: "key_list", list: db.keys }));
    ws.on('message', (msg) => {
        const d = JSON.parse(msg);
        if (d.type === "admin_get_keys") ws.send(JSON.stringify({ type: "key_list", list: db.keys }));
        if (d.type === "admin_delete_key") {
            delete db.keys[d.key];
            wss.clients.forEach(c => c.send(JSON.stringify({ type: "key_list", list: db.keys })));
        }
    });
});

server.listen(process.env.PORT || 8080, '0.0.0.0', () => {
    console.log("Server is running...");
});
