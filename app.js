let currentKey = "ans-default"; // Bạn có thể tạo logic random key sau
let config = {
    settings: { title: "Anshub UI", author: "Admin", icon: "" },
    tabs: [],
    keySystem: { enabled: false, keys: "" }
};

async function login() {
    const user = document.getElementById('u').value;
    const pass = document.getElementById('p').value;
    const res = await fetch('/api/auth', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ user, pass, type: 'login' })
    });
    const result = await res.json();
    if (result.success) {
        document.getElementById('auth-ui').style.display = 'none';
        document.getElementById('main-ui').style.display = 'block';
        loadProject();
    } else alert("Sai thông tin!");
}

function addTab() {
    const name = prompt("Tên Tab:");
    if (name) {
        config.tabs.push({ name: name, elements: [] });
        render();
    }
}

function addControl(tabIdx, type) {
    const name = prompt("Tên bộ điều khiển:");
    if (name) {
        config.tabs[tabIdx].elements.push({ type, name });
        render();
    }
}

function render() {
    const container = document.getElementById('editor');
    container.innerHTML = config.tabs.map((tab, tIdx) => `
        <div class="tab-box">
            <h3>Tab: ${tab.name}</h3>
            <button onclick="addControl(${tIdx}, 'button')">+ Button</button>
            <button onclick="addControl(${tIdx}, 'toggle')">+ Toggle</button>
            <ul>
                ${tab.elements.map(el => `<li>${el.type}: ${el.name}</li>`).join('')}
            </ul>
        </div>
    `).join('');
}

async function save() {
    await fetch('/api/project/save', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ key: currentKey, config })
    });
    alert("Đã đồng bộ lên Cloud!");
}
