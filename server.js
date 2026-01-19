let currentCommand = "stop"; // Lệnh mặc định

// API để Script Roblox lấy lệnh
app.get('/api/get-command', (req, res) => {
    res.send(currentCommand);
});

// API để Web Admin gửi lệnh
app.get('/api/set-command', (req, res) => {
    currentCommand = req.query.cmd;
    res.json({ status: "Success", command: currentCommand });
});
