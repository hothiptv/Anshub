const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Cấu hình tĩnh - Ưu tiên tìm file trong thư mục gốc
app.use(express.static(path.join(__dirname)));

// LẤY TỪ BIẾN MÔI TRƯỜNG TRÊN RAILWAY
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; 
const REPO_OWNER = "hothiptv";           
const REPO_NAME = "Anshub";            
const FILE_PATH = "data.json";                 

// --- CÁC ROUTE TRANG WEB ---

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html'), (err) => {
        if (err) {
            res.status(404).send("<h2>Lỗi: Không tìm thấy file index.html!</h2><p>Hãy đảm bảo bạn đã upload file này lên thư mục gốc.</p>");
        }
    });
});

app.get('/admin', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'admin.html'), (err) => {
        if (err) {
            res.status(404).send("<h2>Lỗi: Không tìm thấy file admin.html!</h2>");
        }
    });
});

// --- API XỬ LÝ DỮ LIỆU ---

// API Lấy dữ liệu
app.get('/get-hub', async (req, res) => {
    try {
        const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
        const response = await axios.get(url, {
            headers: { 
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Cache-Control': 'no-cache',
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
        res.json(JSON.parse(content));
    } catch (error) {
        console.error("Lỗi lấy data:", error.message);
        // Trả về cấu trúc mặc định nếu file chưa tồn tại
        res.json({ tabs: [], scripts: [] });
    }
});

// API Lưu dữ liệu
app.post('/save-hub', async (req, res) => {
    const { newData } = req.body;
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
    
    try {
        let sha = null;
        try {
            const getFile = await axios.get(url, {
                headers: { 
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Cache-Control': 'no-cache' 
                }
            });
            sha = getFile.data.sha;
        } catch (e) { 
            console.log("File chưa tồn tại, sẽ tạo mới."); 
        }

        await axios.put(url, {
            message: "Update từ Anscript Admin",
            content: Buffer.from(JSON.stringify(newData, null, 2)).toString('base64'),
            sha: sha
        }, {
            headers: { 
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Lỗi lưu GitHub:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Lưu thất bại", detail: error.message });
    }
});

// --- KHỞI CHẠY SERVER (BẢN CHUẨN RAILWAY) ---

// Railway yêu cầu dùng process.env.PORT và bind vào 0.0.0.0
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log("------------------------------------");
    console.log(`🚀 ANSHUB IS LIVE!`);
    console.log(`📡 Port: ${PORT}`);
    console.log(`🔗 Domain: anshub-production.up.railway.app`);
    console.log("------------------------------------");
});
