const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

// --- KHAI BÁO THÔNG TIN CỦA ÔNG AN ---
const GITHUB_USER = "hothiptv";      // Tên tài khoản GitHub của ông
const GITHUB_REPO = "Anshub";       // Tên kho chứa của ông
const GITHUB_BRANCH = "main";       // Nhánh chính của kho

// Tự động tạo link Raw dựa trên thông tin trên
const RAW_BASE_URL = ` https://raw.githubusercontent.com/hothiptv/Anshub/main/public/`;

app.get('/get-hub', async (req, res) => {
    try {
        console.log("-----------------------------------------");
        console.log("Đang lấy dữ liệu từ: " + RAW_BASE_URL);

        // Gọi đồng thời cả 2 file tabs.json và scripts.json từ GitHub
        const [tabsRes, scriptsRes] = await Promise.all([
            axios.get(`${RAW_BASE_URL}tabs.json`),
            axios.get(`${RAW_BASE_URL}scripts.json`)
        ]);

        // Trả kết quả về cho Roblox dạng JSON
        res.status(200).json({
            tabs: tabsRes.data,
            scripts: scriptsRes.data
        });

        console.log("Trạng thái: Lấy dữ liệu THÀNH CÔNG!");
        console.log("-----------------------------------------");
    } catch (err) {
        console.error("LỖI KẾT NỐI GITHUB: ", err.message);

        // Trả về lỗi chi tiết để ông nhìn phát biết sai ở đâu luôn
        res.status(500).json({
            status: "error",
            message: "Không tìm thấy dữ liệu trên GitHub",
            debug_info: {
                error_message: err.message,
                tried_url: RAW_BASE_URL,
                check_list: [
                    "Đã tạo thư mục 'public' chưa?",
                    "File 'tabs.json' và 'scripts.json' có viết thường chưa?",
                    "Cấu trúc JSON có bị dư dấu phẩy không?"
                ]
            }
        });
    }
});

// Cấu hình cổng cho Railway (Tự động nhận cổng từ hệ thống)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("=========================================");
    console.log(` SERVER ANS HUB ĐANG CHẠY `);
    console.log(` Link API: http://localhost:${PORT}/get-hub `);
    console.log("=========================================");
});
