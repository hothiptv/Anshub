const express = require('express');
const axios = require('axios');
const app = express();

const GITHUB_USER = "minhnhatdepzai8-cloud"; // Thay bằng user của ông
const GITHUB_REPO = "Farm-Kill-V2"; // Thay bằng repo của ông

app.get('/get-hub', async (req, res) => {
    try {
        const rawUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/public/`;
        const [tabs, scripts] = await Promise.all([
            axios.get(rawUrl + 'tabs.json'),
            axios.get(rawUrl + 'scripts.json')
        ]);
        
        res.json({
            tabs: tabs.data,
            scripts: scripts.data
        });
    } catch (err) {
        res.status(500).json({ error: "Không thể lấy dữ liệu từ GitHub" });
    }
});

app.listen(process.env.PORT || 3000);
