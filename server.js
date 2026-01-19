const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

// Kiểm tra sự tồn tại của file ngay khi server chạy
const htmlPath = path.join(__dirname, 'AnsW.html');
if (fs.existsSync(htmlPath)) {
    console.log("✅ Đã tìm thấy file AnsW.html");
} else {
    console.error("❌ KHÔNG TÌM THẤY FILE AnsW.html! Hãy kiểm tra lại tên file trên GitHub.");
}

app.get('/', (req, res) => {
    if (fs.existsSync(htmlPath)) {
        res.sendFile(htmlPath);
    } else {
        res.status(404).send("Lỗi: Server không tìm thấy file AnsW.html trên bộ nhớ.");
    }
});

// Phục vụ các file tĩnh khác
app.use(express.static(__dirname));

// ... (Các phần code WebSocket và API giữ nguyên)
