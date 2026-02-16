const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

const GITHUB_URL = "https://raw.githubusercontent.com/hothiptv/Anshub/main/public/";

app.get('/get-hub', async (req, res) => {
    let finalTabs = [{ "Name": "Hệ Thống" }];
    let finalScripts = [];

    try {
        // Lấy dữ liệu với cấu hình ép kiểu JSON
        const [tRes, sRes] = await Promise.allSettled([
            axios.get(GITHUB_URL + 'tabs.json', { responseType: 'json' }),
            axios.get(GITHUB_URL + 'scripts.json', { responseType: 'json' })
        ]);

        if (tRes.status === 'fulfilled') {
            finalTabs = tRes.value.data;
        } else {
            console.log("Lỗi tabs.json:", tRes.reason.message);
        }

        if (sRes.status === 'fulfilled') {
            finalScripts = sRes.value.data;
        } else {
            console.log("Lỗi scripts.json:", sRes.reason.message);
            finalScripts = [{
                "tab": "Hệ Thống",
                "name": "LỖI FILE SCRIPTS.JSON",
                "describe": "Railway không đọc được file trên GitHub. Lỗi: " + sRes.reason.message,
                "script": "print('Lỗi kết nối')",
                "img": "rbxassetid://0"
            }];
        }

        res.json({ tabs: finalTabs, scripts: finalScripts });

    } catch (err) {
        res.json({ 
            tabs: [{ "Name": "Lỗi Tổng" }], 
            scripts: [{ "tab": "Lỗi Tổng", "name": "Server Error", "script": "" }] 
        });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("ANSCRIPT Server Online!");
});
