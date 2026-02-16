const PASS = "0904";

function checkAuth() {
    const input = document.getElementById('pass-input').value;
    if(input === PASS) {
        document.getElementById('auth-overlay').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'flex';
        loadDataFromRailway(); // Hàm này sẽ gọi đến Railway để lấy JSON
    } else {
        alert("Sai mật khẩu!");
    }
}

// Giả lập dữ liệu mẫu
let hubData = {
    tabs: [{Name: "Blox Fruits"}],
    scripts: []
};

function addNewTab() {
    let name = prompt("Nhập tên Tab mới:");
    if(name) {
        hubData.tabs.push({Name: name});
        renderSidebar();
    }
}

function renderSidebar() {
    const list = document.getElementById('tab-list');
    list.innerHTML = "";
    hubData.tabs.forEach(tab => {
        let div = document.createElement('div');
        div.className = "tab-item";
        div.innerHTML = `<span class="tab-name">📁 ${tab.Name} <span onclick="addNewFile('${tab.Name}')" style="float:right">+</span></span>`;
        list.appendChild(div);
    });
}

function addNewFile(tabName) {
    let name = prompt("Nhập tên Script mới cho " + tabName + ":");
    if(name) {
        hubData.scripts.push({name: name, tab: tabName, img: "", script: "", describe: ""});
        renderSidebar();
    }
}

renderSidebar();
