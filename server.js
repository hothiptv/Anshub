// Biến lưu cấu hình trong bộ nhớ Server
let adminConfig = {
    lv_user_id: "", 
    lv_api_key: "",
    timer: 24
};

// API để Web Admin gửi cấu hình lên
app.use(express.json()); // Để server đọc được dữ liệu gửi lên
app.post('/api/save-config', (req, res) => {
    const { userId, apiKey, timer } = req.body;
    adminConfig.lv_user_id = userId;
    adminConfig.lv_api_key = apiKey;
    adminConfig.timer = timer;
    
    console.log("Đã cập nhật cấu hình API mới!");
    res.json({ success: true, message: "Đã lưu cấu hình thành công!" });
});

// API lấy link Get Key (Sẽ dùng config đã lưu)
app.get('/api/get-link', (req, res) => {
    if (!adminConfig.lv_user_id) {
        return res.status(400).json({ error: "Admin chưa thiết lập ID Linkvertise!" });
    }
    const step = req.query.step || 1;
    const target = `https://${req.get('host')}/getkey.html?step=${step == 1 ? 2 : 'done'}`;
    
    // Tạo link động dựa trên ID đã nhập
    const finalLink = `https://link-to.net/${adminConfig.lv_user_id}/ans-key-${step}/dynamic?r=${btoa(target)}`;
    res.json({ url: finalLink });
});
