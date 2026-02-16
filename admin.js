const PASS = "0904";
let hubData = { tabs: [], scripts: [] };
let currentEditIndex = null;
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

// 2. TẢI DỮ LIỆU TỪ SERVER (GITHUB)
async function loadDataFromServer() {
    try {
        const res = await fetch(`${API_URL}/get-hub`);
        hubData = await res.json();
        renderSidebar();
    } catch (e) {
        console.error("Lỗi tải data:", e);
    }
}

// 3. HIỂN THỊ DANH SÁCH BÊN TRÁI (SIDEBAR)
function renderSidebar() {
    const list = document.getElementById('tab-list');
    list.innerHTML = "";
    hubData.tabs.forEach((tab, tIdx) => {
        const tabDiv = document.createElement('div');
        tabDiv.className = "tab-item";
        tabDiv.innerHTML = `
            <div class="tab-name" style="color:var(--accent); font-weight:bold; margin-top:10px">
                📁 ${tab.Name} 
                <span style="color:red; cursor:pointer; font-size:12px" onclick="deleteTab(${tIdx})"> [Xóa]</span>
                <span onclick="addNewFile('${tab.Name}')" style="float:right; cursor:pointer; color:#fff">[+]</span>
            </div>
        `;
        hubData.scripts.forEach((s, sIdx) => {
            if (s.tab === tab.Name) {
                const fileDiv = document.createElement('div');
                fileDiv.className = "file-item";
                fileDiv.style.paddingLeft = "15px";
                fileDiv.style.cursor = "pointer";
                fileDiv.innerHTML = `📄 ${s.name} <span style="color:red; float:right" onclick="deleteScript(${sIdx})">×</span>`;
                fileDiv.onclick = (e) => { if (e.target.tagName !== 'SPAN') openEditor(sIdx); };
                tabDiv.appendChild(fileDiv);
            }
        });
        list.appendChild(tabDiv);
    });
}

// 4. MỞ TRÌNH SOẠN THẢO
function openEditor(index) {
    currentEditIndex = index;
    const s = hubData.scripts[index];
    document.getElementById('editing-filename').innerText = "Đang sửa: " + s.name;
    document.getElementById('script-name').value = s.name;
    document.getElementById('script-img').value = s.img || "";
    document.getElementById('script-content').value = s.script || "";
    document.getElementById('script-desc').value = s.describe || "";
    
    // Kiểm tra link ảnh để mở/khóa nút TL
    checkImgLink();
}

// 5. LOGIC NÚT TL (TỈ LỆ ẢNH)
function checkImgLink() {
    const imgValue = document.getElementById('script-img').value;
    const tlBtn = document.getElementById('tl-btn');
    if (imgValue.trim().includes("http")) {
        tlBtn.disabled = false;
        tlBtn.style.opacity = "1";
        tlBtn.style.cursor = "pointer";
    } else {
        tlBtn.disabled = true;
        tlBtn.style.opacity = "0.3";
        tlBtn.style.cursor = "not-allowed";
    }
}

function selectRatio() {
    if (currentEditIndex === null) return;
    let choice = prompt("Chọn tỉ lệ cho Card:\n1. Hình vuông (1:1)\n2. Video ngang (16:9)\n3. Điện thoại dọc (9:16)", "3");
    
    if (choice == "1") hubData.scripts[currentEditIndex].ratio = "ratio-1-1";
    else if (choice == "2") hubData.scripts[currentEditIndex].ratio = "ratio-16-9";
    else if (choice == "3") hubData.scripts[currentEditIndex].ratio = "ratio-9-16";
    
    alert("Đã áp dụng tỉ lệ: " + (hubData.scripts[currentEditIndex].ratio));
}

// 6. THÊM / XÓA
function addNewTab() {
    const name = prompt("Tên Tab mới:");
    if (name) { hubData.tabs.push({ Name: name }); renderSidebar(); }
}

function addNewFile(tabName) {
    const name = prompt(`Tên Script mới cho [${tabName}]:`);
    if (name) {
        hubData.scripts.push({
            name: name,
            tab: tabName,
            img: "",
            script: "",
            describe: "Creator: Admin",
            ratio: "ratio-9-16" // Mặc định là dọc
        });
        renderSidebar();
        openEditor(hubData.scripts.length - 1);
    }
}

function deleteTab(idx) { if(confirm("Xóa tab này?")) { hubData.tabs.splice(idx,1); renderSidebar(); } }
function deleteScript(idx) { if(confirm("Xóa script này?")) { hubData.scripts.splice(idx,1); renderSidebar(); } }

// 7. LƯU LÊN GITHUB
async function saveData() {
    if (currentEditIndex !== null) {
        const s = hubData.scripts[currentEditIndex];
        s.name = document.getElementById('script-name').value;
        s.img = document.getElementById('script-img').value;
        s.script = document.getElementById('script-content').value;
        s.describe = document.getElementById('script-desc').value;
    }

    const btn = document.getElementById('save-btn');
    btn.innerText = "ĐANG LƯU...";
    btn.disabled = true;

    try {
        const res = await fetch(`${API_URL}/save-hub`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newData: hubData })
        });
        if (res.ok) alert("✅ Đã lưu thành công lên GitHub!");
        else alert("❌ Lỗi: Không lưu được. Kiểm tra GitHub Token!");
    } catch (e) {
        alert("❌ Lỗi kết nối Server!");
    } finally {
        btn.innerText = "LƯU DỮ LIỆU (SAVE)";
        btn.disabled = false;
        renderSidebar();
    }
}
