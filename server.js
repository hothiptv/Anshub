const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

let playerStates = {};

app.use(express.static(__dirname));

// API nhận lệnh từ Web
app.get('/api/send', (req, res) => {
    const { user, cmd, x, y } = req.query;
    if (!user) return res.status(400).send("No user");
    
    playerStates[user] = {
        cmd: cmd || "idle",
        x: parseFloat(x) || 0,
        y: parseFloat(y) || 0,
        time: Date.now()
    };
    res.send("OK");
});

// API cho Game lấy lệnh
app.get('/api/get-command', (req, res) => {
    const user = req.query.user;
    if (playerStates[user]) {
        res.json(playerStates[user]);
        // Reset lệnh tức thời
        if (["jump", "q", "e", "esc", "tab"].includes(playerStates[user].cmd)) {
            playerStates[user].cmd = "idle";
        }
    } else {
        res.json({ cmd: "idle", x: 0, y: 0 });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log("Server Ready!"));
