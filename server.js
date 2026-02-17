const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// LẤY TỪ BIẾN BIẾN MÔI TRƯỜNG TRÊN RAILWAY
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; 
const REPO_OWNER = "hothiptv";           
const REPO_NAME = "Anshub";            
const FILE_PATH = "data.json";                 

app.use(express.static(__dirname));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

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
        console.error("Lỗi lấy data:", error.message);
        res.json({ tabs: [], scripts: [] });
    }
});

// API Lưu dữ liệu - FIX LỖI NOT FOUND / SHA
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
        } catch (e) { console.log("File mới hoàn toàn"); }

        await axios.put(url, {
            message: "Update from Anscript Admin",
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
app.listen(PORT, () => console.log(`Anscript Hub running on port ${PORT}`));
