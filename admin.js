const PASS = "0904";
const RAILWAY_URL = "https://anshub-production.up.railway.app"; // Thay link Railway của ông vào đây
let hubData = { tabs: [], scripts: [] };
let currentFileIndex = null;
let currentSha = ""; // Dùng để định danh file trên GitHub khi lưu

// 1. KIỂM TRA MẬT KHẨU
function checkAuth() {
    const input = document.getElementById('pass-input').value;
    if(input === PASS) {
        document.getElementById('auth-overlay').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'flex';
        loadData();
    } else {
        alert("Sai mật khẩu rồi đại ca ơi!");
    }
}

// 2. LẤY DỮ LIỆU TỪ SERVER VỀ
async function loadData() {
    try {
        const res = await fetch(`${RAILWAY_URL}/get-hub`);
        const data = await res.json();
        hubData = data;
        renderSidebar();
    } catch (e) {
        alert("Lỗi kết nối Railway! Hãy kiểm tra link server.");
    }
}

// 3. HIỂN THỊ DANH SÁCH BÊN TRÁI (FILE EXPLORER)
function renderSidebar() {
    const list = document.getElementById('tab-list');
    list.innerHTML = "";

    hubData.tabs.forEach((tab, tIdx) => {
        let tabDiv = document.createElement('div');
        tabDiv.className = "tab-item";
        tabDiv.innerHTML = `
            <div class="tab-name">
                📁 ${tab.Name} 
                <span class="add-file-icon" onclick="addNewFile('${tab.Name}')" title="Thêm script vào tab này">+</span>
            </div>
        `;

        // Tìm các script thuộc tab này
        hubData.scripts.forEach((s, sIdx) => {
            if(s.tab === tab.Name) {
                let fileDiv = document.createElement('div');
                fileDiv.className = "file-item";
                fileDiv.innerText = `📄 ${s.name}`;
                fileDiv.onclick = () => openEditor(sIdx);
                tabDiv.appendChild(fileDiv);
            }
        });
        list.appendChild(tabDiv);
    });
}

// 4. MỞ KHUNG CHỈNH SỬA BÊN PHẢI
function openEditor(index) {
    currentFileIndex = index;
    const s = hubData.scripts[index];
    
    document.getElementById('editing-filename').innerText = "Đang sửa: " + s.name;
    document.getElementById('script-name').value = s.name;
    document.getElementById('script-img').value = s.img || "";
    document.getElementById('script-content').value = s.script || "";
    document.getElementById('script-desc').value = `Creator: ${s.cre || ''}\nYear: ${s.year || ''}\nDesc: ${s.describe || ''}`;
    
    // Hiệu ứng phát sáng khi chọn
    document.querySelectorAll('.file-item').forEach(el => el.style.color = "#bbb");
    event.target.style.color = "var(--accent)";
}

// 5. THÊM TAB & FILE MỚI
function addNewTab() {
    let name = prompt("Nhập tên Tab mới (Ví dụ: Blox Fruits):");
    if(name) {
        hubData.tabs.push({ Name: name });
        renderSidebar();
    }
}

function addNewFile(tabName) {
    let name = prompt(`Nhập tên Script mới cho Tab [${tabName}]:`);
    if(name) {
        hubData.scripts.push({
            name: name,
            tab: tabName,
            img: "",
            script: "",
            cre: "Admin",
            year: "2026",
            describe: ""
        });
        renderSidebar();
        openEditor(hubData.scripts.length - 1);
    }
}

// 6. LƯU DỮ LIỆU (QUAN TRỌNG NHẤT)
async function saveData() {
    if(currentFileIndex !== null) {
        // Cập nhật dữ liệu từ các ô nhập vào biến hubData
        const s = hubData.scripts[currentFileIndex];
        s.name = document.getElementById('script-name').value;
        s.img = document.getElementById('script-img').value;
        s.script = document.getElementById('script-content').value;
        
        // Tách mô tả (Tạm thời đơn giản)
        s.describe = document.getElementById('script-desc').value;
    }

    const btn = document.querySelector('.save-btn');
    btn.innerText = "ĐANG LƯU...";
    btn.disabled = true;

    try {
        const res = await fetch(`${RAILWAY_URL}/save-hub`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newData: hubData })
        });

        if(res.ok) {
            alert("Đã lưu thành công lên GitHub!");
            renderSidebar();
        } else {
            alert("Lưu thất bại! Kiểm tra lại Token GitHub trên Railway.");
        }
    } catch (e) {
        alert("Lỗi kết nối khi lưu!");
    } finally {
        btn.innerText = "LƯU DỮ LIỆU (SAVE)";
        btn.disabled = false;
    }
}
