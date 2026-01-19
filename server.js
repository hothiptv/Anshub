let botCommand = "stop"; // Lệnh mặc định là dừng

// API để Admin ra lệnh (An bấm trên web)
app.get('/api/set-bot', (req, res) => {
    botCommand = req.query.cmd; // ví dụ: ?cmd=start_farm
    res.json({ success: true, current: botCommand });
});

// API để Script Roblox lấy lệnh về
app.get('/api/get-bot', (req, res) => {
    res.send(botCommand);
});
