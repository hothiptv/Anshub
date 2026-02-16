const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

// --- CẤU HÌNH GITHUB ---
const RAW_URL = "https://raw.githubusercontent.com/hothiptv/Anshub/main/public/";

app.get('/get-hub', async (req, res) => {
    try {
        console.log("Đang gọi GitHub: " + RAW_URL);

        // Gọi dữ liệu với thời gian chờ 3 giây (tránh treo server)
        const tRes = await axios.get(`${RAW_URL}tabs.json`, { timeout: 3000 });
        const sRes = await axios.get(`${RAW_URL}scripts.json`, { timeout: 3000 });

        res.json({
            tabs: tRes.data,
            scripts: sRes.data
        });
        console.log("Thành công!");
    } catch (err) {
        console.log("GitHub lỗi, đang dùng dữ liệu dự phòng...");
        
        // TRẢ VỀ DỮ LIỆU DỰ PHÒNG KHI GITHUB LỖI
        res.json({
            tabs: [{ "Name": "TSB Scripts", "Game": "TSB" }],
            scripts: [{
                "tab": "lỗi",
                "name": "Checking System...",
                "describe": "lỗi",
                "game": "lỗi",
                "script": "lỗi",
                "cre": "lỗi",
                "img": "lỗi",
                "yearlooix": "lỗi"
            }]
        });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server ANS Hub đã Online!");
});
