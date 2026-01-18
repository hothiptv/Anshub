let currentKey = "";
let projectData = {};

async function handleAuth(type) {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const res = await fetch(`/api/auth/${type}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ user, pass })
    });
    if (res.ok) {
        if (type === 'login') {
            document.getElementById('auth-page').style.display = 'none';
            document.getElementById('main-dashboard').style.display = 'flex';
            loadOrCreateProject(user);
        } else { alert("Đăng ký thành công!"); }
    } else { alert("Thất bại!"); }
}

async function loadOrCreateProject(user) {
    // Logic đơn giản: tạo mới nếu chưa có
    const res = await fetch('/api/project/create', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ name: "My Script", owner: user })
    });
    const data = await res.json();
    currentKey = data.apiKey;
    fetchProject();
}

async function fetchProject() {
    const res = await fetch(`/api/v1/fetch/${currentKey}`);
    projectData = await res.json();
    renderSettings();
}

function renderSettings() {
    const editor = document.getElementById('editor');
    editor.innerHTML = `
        <div class="form-group">
            <label>Tên Script</label>
            <input type="text" value="${projectData.settings.title}" onchange="projectData.settings.title=this.value">
            <label>Màu chủ đạo (Hex)</label>
            <input type="color" value="${projectData.settings.accent}" onchange="projectData.settings.accent=this.value">
            <label>Độ trong suốt</label>
            <input type="checkbox" ${projectData.settings.transparent ? 'checked' : ''} onchange="projectData.settings.transparent=this.checked">
        </div>
        <hr>
        <h3>Thêm Tab Mới</h3>
        <input type="text" id="new-tab-name" placeholder="Tên Tab">
        <button onclick="addTab()">Thêm Tab</button>
        <div id="tab-list"></div>
    `;
    renderTabs();
}

function addTab() {
    const name = document.getElementById('new-tab-name').value;
    projectData.tabs.push({ name, icon: "rbxassetid://", elements: [] });
    renderTabs();
}

function renderTabs() {
    const list = document.getElementById('tab-list');
    list.innerHTML = projectData.tabs.map((tab, tIdx) => `
        <div class="tab-item">
            <h4>Tab: ${tab.name} <button onclick="projectData.tabs.splice(${tIdx},1);renderTabs()">Xóa</button></h4>
            <button onclick="addElement(${tIdx}, 'button')">+ Thêm Button</button>
            <button onclick="addElement(${tIdx}, 'toggle')">+ Thêm Toggle</button>
            <div class="elements">
                ${tab.elements.map((el, eIdx) => `
                    <div class="el-item">
                        <span>${el.type}: ${el.name}</span>
                        <button onclick="projectData.tabs[${tIdx}].elements.splice(${eIdx},1);renderTabs()">x</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

async function saveProject() {
    await fetch('/api/project/update', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ apiKey: currentKey, config: projectData })
    });
    alert("Đã lưu thành công!");
}
