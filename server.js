const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Cấu hình GitHub của ông
const GITHUB_TOKEN = "TOKEN_CUA_ONG"; // Lấy trong Settings > Developer Settings > Personal Access Tokens
const REPO_OWNER = "TEN_USER_GITHUB";
const REPO_NAME = "TEN_KHO_LƯU_TRỮ";
const FILE_PATH = "data.json"; 

// API lấy dữ liệu từ GitHub trả về cho Web/Roblox
app.get('/get-hub', async (req, res) => {
    try {
        const response = await axios.get(`https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${FILE_PATH}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Không lấy được dữ liệu" });
    }
});

// API lưu dữ liệu từ trang Admin lên GitHub
app.post('/save-hub', async (req, res) => {
    const { newData, sha } = req.body; // Cần mã SHA của file cũ để ghi đè
    try {
        await axios.put(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
            message: "Update từ Anscript Admin",
            content: Buffer.from(JSON.stringify(newData, null, 2)).toString('base64'),
            sha: sha
        }, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Lưu thất bại" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server chạy tại cổng ${PORT}`));
