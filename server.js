const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// --- CẤU HÌNH GITHUB (THAY THÔNG TIN CỦA ÔNG VÀO ĐÂY) ---
const GITHUB_TOKEN = "ghp_xxxxxxxxxxxxxxxxxxxx"; // Token ông lấy từ GitHub Settings
const REPO_OWNER = "Tên_User_GitHub";           // Ví dụ: TrongAn2026
const REPO_NAME = "Tên_Repository";            // Ví dụ: Anscript-Data
const FILE_PATH = "data.json";                 // File lưu trữ dữ liệu

// Cấp quyền truy cập các file tĩnh (html, css, js trong cùng thư mục)
app.use(express.static(__dirname));

// Route chính: Vào link gốc hiện index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route Admin: Vào /admin hiện admin.html
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// API 1: Lấy dữ liệu từ GitHub về cho Web/Roblox
app.get('/get-hub', async (req, res) => {
    try {
        const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
        const response = await axios.get(url, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });
        // Giải mã nội dung từ Base64 sang JSON
        const content = Buffer.from(response.data.content, 'base64').toString();
        res.json(JSON.parse(content));
    } catch (error) {
        console.error("Lỗi lấy data:", error.message);
        res.status(500).json({ error: "Không thể lấy dữ liệu từ GitHub" });
    }
});

// API 2: Lưu dữ liệu từ Admin Panel lên GitHub
app.post('/save-hub', async (req, res) => {
    const { newData } = req.body;
    try {
        const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
        
        // Bước 1: Phải lấy mã SHA của file cũ thì mới ghi đè được
        const getFile = await axios.get(url, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });
        const sha = getFile.data.sha;

        // Bước 2: Đẩy dữ liệu mới lên
        await axios.put(url, {
            message: "Cập nhật từ Anscript Admin Web",
            content: Buffer.from(JSON.stringify(newData, null, 2)).toString('base64'),
            sha: sha
        }, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Lỗi lưu data:", error.message);
        res.status(500).json({ error: "Lưu thất bại", details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server Anscript Hub đang chạy tại Port ${PORT}`));
