const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// Đường dẫn GitHub của ông (Thay user và repo)
const GITHUB_RAW = "https://raw.githubusercontent.com/AnOwner/ans-hub-cloud/main/";

app.get('/get-hub', async (req, res) => {
    try {
        const tabs = await axios.get(`${GITHUB_RAW}public/data.json`);
        const scripts = await axios.get(`${GITHUB_RAW}public/scripts.json`);
        
        res.json({
            tabs: tabs.data,
            scripts: scripts.data
        });
    } catch (err) {
        res.status(500).send("Error fetching GitHub data");
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
