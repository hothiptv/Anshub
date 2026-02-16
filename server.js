const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// --- PHẦN CẤU HÌNH GITHUB ---
const GITHUB_TOKEN = "TOKEN_CỦA_ÔNG"; 
const REPO_OWNER = "TÊN_USER";
const REPO_NAME = "TÊN_REPO";
const FILE_PATH = "data.json";

// --- QUAN TRỌNG: ĐOẠN NÀY ĐỂ HIỆN GIAO DIỆN WEB ---
// Nó sẽ biến thư mục hiện tại thành kho chứa web
app.use(express.static(path.join(__currentDirname || __dirname, '/')));

// Khi vào trang gốc (/) thì hiện index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Khi vào /admin thì hiện admin.html
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// --- CÁC API XỬ LÝ DỮ LIỆU ---
app.get('/get-hub', async (req, res) => {
    try {
        const response = await axios.get(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });
        // Giải mã base64 từ GitHub
        const content = Buffer.from(response.data.content, 'base64').toString();
        res.json(JSON.parse(content));
    } catch (error) {
        res.status(500).json({ error: "Không lấy được dữ liệu từ GitHub" });
    }
});

app.post('/save-hub', async (req, res) => {
    const { newData } = req.body;
    try {
        // 1. Lấy mã SHA (mã định danh phiên bản) của file cũ
        const oldFile = await axios.get(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });
        const sha = oldFile.data.sha;

        // 2. Ghi đè file mới lên GitHub
        await axios.put(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
            message: "Update from Anscript Admin Panel",
            content: Buffer.from(JSON.stringify(newData, null, 2)).toString('base64'),
            sha: sha
        }, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Lưu thất bại!", detail: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server Anscript đang chạy tại cổng ${PORT}`));
