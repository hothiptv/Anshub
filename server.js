const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Tăng giới hạn để lưu data lớn

// --- CẤU HÌNH GITHUB ---
const GITHUB_TOKEN = "GẮN_TOKEN_MỚI_CỦA_ÔNG_VÀO_ĐÂY"; 
const REPO_OWNER = "hothiptv";           
const REPO_NAME = "Anshub";            
const FILE_PATH = "data.json";                 

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// API Lấy dữ liệu
app.get('/get-hub', async (req, res) => {
    try {
        const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
        const response = await axios.get(url, {
            headers: { 
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Cache-Control': 'no-cache'
            }
        });
        const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
        res.json(JSON.parse(content));
    } catch (error) {
        console.error("Lỗi lấy data:", error.response ? error.response.data : error.message);
        // Nếu file chưa tồn tại, trả về cấu trúc trống thay vì lỗi 500
        res.json({ tabs: [], scripts: [] });
    }
});

// API Lưu dữ liệu (Đã fix lỗi ghi đè khi đổi Ratio)
app.post('/save-hub', async (req, res) => {
    const { newData } = req.body;
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
    
    try {
        let sha = null;
        try {
            const getFile = await axios.get(url, {
                headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
            });
            sha = getFile.data.sha;
        } catch (e) {
            console.log("File mới, chưa có SHA");
        }

        await axios.put(url, {
            message: "Cập nhật dữ liệu Anscript Hub",
            content: Buffer.from(JSON.stringify(newData, null, 2)).toString('base64'),
            sha: sha
        }, {
            headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Lỗi lưu GitHub:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Lưu thất bại" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server đang chạy tại ${PORT}`));
