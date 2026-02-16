const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

// Thay đổi thông tin tại đây
const GITHUB_USER = "minhnhatdepzai8-cloud"; 
const GITHUB_REPO = "Farm-Kill-V2"; 
const RAW_URL = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/public/`;

app.get('/get-hub', async (req, res) => {
    try {
        console.log("Đang lấy dữ liệu từ GitHub...");
        
        // Lấy dữ liệu đồng thời từ 2 file
        const [tabsRes, scriptsRes] = await Promise.all([
            axios.get(RAW_URL + 'tabs.json', { timeout: 5000 }),
            axios.get(RAW_URL + 'scripts.json', { timeout: 5000 })
        ]);

        // Trả về kết quả cho Roblox
        res.status(200).json({
            tabs: tabsRes.data,
            scripts: scriptsRes.data
        });
        
        console.log("Gửi dữ liệu thành công!");
    } catch (err) {
        console.error("Lỗi GitHub:", err.message);
        // Trả về dữ liệu mẫu để Hub không bị trống nếu GitHub lỗi
        res.status(200).json({
            tabs: [{ "Name": "Lỗi Kết Nối", "Game": "GitHub" }],
            scripts: [{
                "name": "Lỗi Server",
                "describe": "Không thể lấy dữ liệu từ GitHub. Kiểm tra lại link Raw.",
                "game": "Error",
                "cre": "System",
                "img": "rbxassetid://0",
                "year": "2026"
            }]
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server ANS Hub đang chạy tại cổng: ${PORT}`);
});
