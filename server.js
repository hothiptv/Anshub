// API lấy link Get Key chuẩn
app.get('/api/get-link', (req, res) => {
    const step = req.query.step || 1;
    const userId = "2650959";
    let target;
    
    // Đảm bảo domain là link Railway của An
    const domain = `https://${req.get('host')}`;

    if (step == "1") {
        target = `${domain}/getkey.html?step=2`;
    } else if (step == "2") {
        target = `${domain}/getkey.html?step=done`;
    }

    const finalLink = `https://link-to.net/${userId}/${Math.random().toString(36).substring(7)}/dynamic?r=${btoa(target)}`;
    res.json({ url: finalLink });
});
