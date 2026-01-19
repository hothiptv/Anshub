const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(__dirname));
app.use(express.json());

// Dữ liệu tạm thời
let db = { keys: {}, config: { lv_id: "2650959" } };

// Phải có dòng này để Railway không báo lỗi "Failed to respond"
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'AnsW.html'));
});

// API Verify cho Script Roblox (Trả về cực nhanh)
app.get('/api/verify', (req, res) => {
    const key = req.query.key;
    if (db.keys[key]) {
        res.send("true");
    } else {
        res.send("false");
    }
});

// API Generate Key cho trang Get Key
app.get('/api/generate-key', (req, res) => {
    const newKey = "ans-" + Math.random().toString(36).substring(2, 10);
    db.keys[newKey] = { expires: Date.now() + 86400000 };
    res.json({ key: newKey });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log("Server online at port " + PORT);
});
