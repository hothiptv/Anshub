const RemoteTabs = [
    {
        name: "Người chơi",
        author: "Anscript",
        features: [
            { type: "slider", name: "Tốc độ (Speed)", action: "walkspeed", min: 16, max: 500 },
            { type: "button", name: "Nhảy cao (Infinite Jump)", action: "inf_jump" },
            { type: "toggle", name: "Xuyên tường (Noclip)", action: "noclip" }
        ]
    },
    {
        name: "Thế giới",
        author: "Anscript",
        features: [
            { type: "button", name: "Xóa mù (No Fog)", action: "nofog" },
            { type: "button", name: "Bay (Fly)", action: "fly" }
        ]
    }
];

// Hàm này sẽ tự động vẽ UI lên web từ dữ liệu trên
function renderTabs() {
    const container = document.getElementById('tabs-container');
    RemoteTabs.forEach(tab => {
        let tabHTML = `<div class="card"><h3>${tab.name}</h3><small>By ${tab.author}</small>`;
        tab.features.forEach(f => {
            if(f.type === "button") tabHTML += `<button class="btn" onclick="sendCommand('${f.action}', true)">${f.name}</button>`;
            if(f.type === "slider") tabHTML += `<p>${f.name}</p><input type="range" min="${f.min}" max="${f.max}" oninput="sendCommand('${f.action}', this.value)">`;
        });
        tabHTML += `</div>`;
        container.innerHTML += tabHTML;
    });
}
 
