const PASS = "0904";
let hubData = { tabs: [], scripts: [] };
let currentEditIndex = null;

// Tự động lấy link Railway đang chạy
const API_URL = window.location.origin; 

// 1. KIỂM TRA MẬT KHẨU
function checkAuth() {
    const input = document.getElementById('pass-input').value;
    if (input === PASS) {
        document.getElementById('auth-overlay').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'flex';
        loadDataFromServer();
    } else {
        alert("Mật khẩu sai rồi đại ca!");
    }
}

// 2. TẢI DỮ LIỆU TỪ SERVER
async function loadDataFromServer() {
    try {
        const res = await fetch(`${API_URL}/get-hub`);
        hubData = await res.json();
        renderSidebar();
    } catch (e) {
        console.error("Lỗi tải data:", e);
    }
}

// 3. HIỂN THỊ DANH SÁCH BÊN TRÁI
function renderSidebar() {
    const list = document.getElementById('tab-list');
    list.innerHTML = "";

    hubData.tabs.forEach((tab, tIdx) => {
        const tabDiv = document.createElement('div');
        tabDiv.className = "tab-item";
        tabDiv.innerHTML = `
            <div class="tab-name">
                📁 ${tab.Name} 
                <span style="color:red; cursor:pointer; font-size:12px" onclick="deleteTab(${tIdx})"> [Xóa]</span>
                <span class="add-btn" onclick="addNewFile('${tab.Name}')" style="float:right; cursor:pointer">+</span>
            </div>
        `;

        hubData.scripts.forEach((s, sIdx) => {
            if (s.tab === tab.Name) {
                const fileDiv = document.createElement('div');
                fileDiv.className = "file-item";
                fileDiv.innerHTML = `📄 ${s.name} <span style="color:red; float:right" onclick="deleteScript(${sIdx})">×</span>`;
                fileDiv.onclick = (e) => {
                    if (e.target.tagName !== 'SPAN') openEditor(sIdx);
                };
                tabDiv.appendChild(fileDiv);
            }
        });
        list.appendChild(tabDiv);
    });
}

// 4. MỞ KHUNG SOẠN THẢO
function openEditor(index) {
    currentEditIndex = index;
    const s = hubData.scripts[index];
    document.getElementById('editing-filename').innerText = "Đang sửa: " + s.name;
    document.getElementById('script-name').value = s.name;
    document.getElementById('script-img').value = s.img || "";
    document.getElementById('script-content').value = s.script || "";
    document.getElementById('script-desc').value = s.describe || "";
}

// 5. THÊM TAB & SCRIPT MỚI
function addNewTab() {
    const name = prompt("Tên Tab mới:");
    if (name) {
        hubData.tabs.push({ Name: name });
        renderSidebar();
    }
}

function addNewFile(tabName) {
    const name = prompt(`Tên Script cho ${tabName}:`);
    if (name) {
        hubData.scripts.push({
            name: name,
            tab: tabName,
            img: "",
            script: "",
            describe: "Creator: Admin\nYear: 2026",
        });
        renderSidebar();
        openEditor(hubData.scripts.length - 1);
    }
}

// 6. XÓA
function deleteTab(idx) { if(confirm("Xóa tab?")) { hubData.tabs.splice(idx,1); renderSidebar(); } }
function deleteScript(idx) { if(confirm("Xóa script?")) { hubData.scripts.splice(idx,1); renderSidebar(); } }

// 7. LƯU LÊN SERVER (GỬI ĐẾN RAILWAY)
async function saveData() {
    if (currentEditIndex !== null) {
        const s = hubData.scripts[currentEditIndex];
        s.name = document.getElementById('script-name').value;
        s.img = document.getElementById('script-img').value;
        s.script = document.getElementById('script-content').value;
        s.describe = document.getElementById('script-desc').value;
    }

    const btn = document.querySelector('.save-btn');
    btn.innerText = "ĐANG LƯU...";
    btn.disabled = true;

    try {
        const res = await fetch(`${API_URL}/save-hub`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newData: hubData })
        });

        if (res.ok) {
            alert("Đã lưu thành công lên GitHub!");
        } else {
            alert("Lỗi khi lưu! Kiểm tra GitHub Token.");
        }
    } catch (e) {
        alert("Lỗi kết nối server!");
    } finally {
        btn.innerText = "LƯU DỮ LIỆU (SAVE)";
        btn.disabled = false;
        renderSidebar();
    }
}
