const API = window.location.origin;
const DEF = "https://i.ibb.co/szRg104/image.png";
let db = { tabs: [], scripts: [] }, curI = null;

// 1. Khởi hhmtạo & Đăng nhập
function login() {
    if(document.getElementById('pass').value === "0904") {
        document.getElementById('auth').style.display = 'none';
        load();
    } else {
        alert("Mật khẩu sai rồi!");
    }
}

async function load() {
    try {
        const r = await fetch(`${API}/get-hub`);
        db = await r.json();
        render();
    } catch(e) {
        alert("Không thể kết nối tới server Railway!");
    }
}

// 2. Hiển thị Sidebar với tính năng Thu gọn (Collapse)
function render() {
    const container = document.getElementById('sList');
    container.innerHTML = "";
    
    db.tabs.forEach((t, ti) => {
        const block = document.createElement('div');
        block.className = "tab-block";
        block.id = `tab-${ti}`;
        
        // Lọc các script thuộc tab này
        const scriptsInTab = db.scripts.filter(s => s.tab === t.Name);
        
        block.innerHTML = `
            <div class="tab-header" onclick="toggleTab(${ti})">
                <div class="tab-title"><span>📁</span> ${t.Name}</div>
                <div class="tab-actions">
                    <button onclick="event.stopPropagation(); editT(${ti})">✏️</button>
                    <button onclick="event.stopPropagation(); delT(${ti})">🗑️</button>
                    <button onclick="event.stopPropagation(); addS('${t.Name}')">➕</button>
                    <button class="btn-collapse">^</button>
                </div>
            </div>
            <div class="file-list">
                ${scriptsInTab.map(s => {
                    const realIdx = db.scripts.indexOf(s);
                    return `
                        <div class="file-item" onclick="openE(${realIdx})">
                            <span>📄 ${s.name}</span>
                            <span class="del-file" onclick="event.stopPropagation(); delS(${realIdx})">✕</span>
                        </div>`;
                }).join('')}
            </div>
        `;
        container.appendChild(block);
    });
}

function toggleTab(i) {
    document.getElementById(`tab-${i}`).classList.toggle('collapsed');
}

// 3. Trình soạn thảo (Editor)
function openE(i) {
    curI = i;
    const s = db.scripts[i];
    document.getElementById('main').style.display = 'block';
    document.getElementById('name').value = s.name;
    // Nếu ảnh là mặc định thì để trống cho dễ nhìn, khi lưu sẽ tự điền lại
    document.getElementById('img').value = (s.img === DEF) ? "" : s.img;
    document.getElementById('script').value = s.script || "";
    document.getElementById('desc').value = s.describe || "";
}

// 4. Lưu dữ liệu - TỐI ƯU NÉN 1 DÒNG (Minify)
async function save() {
    if(curI !== null) {
        db.scripts[curI].name = document.getElementById('name').value;
        let iv = document.getElementById('img').value.trim();
        // Tự động chèn ảnh mặc định nếu trống
        db.scripts[curI].img = (iv === "") ? DEF : iv;
        db.scripts[curI].script = document.getElementById('script').value;
        db.scripts[curI].describe = document.getElementById('desc').value;
    }

    const btn = document.getElementById('saveB');
    btn.innerText = "MINIFYING & SAVING...";
    btn.disabled = true;

    try {
        // Gửi dữ liệu đi - Railway/GitHub sẽ nhận bản JSON nén
        const res = await fetch(`${API}/save-hub`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newData: db }) // JSON.stringify mặc định đã nén nếu không có tham số space
        });

        if(res.ok) {
            alert("✅ Đã nén dữ liệu và lưu thành công!");
        } else {
            alert("❌ Lỗi khi lưu lên GitHub!");
        }
    } catch(e) {
        alert("❌ Lỗi kết nối!");
    } finally {
        btn.innerText = "SAVE TO DATABASE (GITHUB)";
        btn.disabled = false;
        render();
    }
}

// 5. Các hàm bổ trợ
function addT() { 
    let n = prompt("Tên chuyên mục mới:"); 
    if(n) { db.tabs.push({Name: n}); render(); } 
}

function editT(i) {
    let n = prompt("Đổi tên chuyên mục:", db.tabs[i].Name);
    if(n) {
        let old = db.tabs[i].Name;
        db.tabs[i].Name = n;
        db.scripts.forEach(s => { if(s.tab === old) s.tab = n; });
        render();
    }
}

function delT(i) {
    if(confirm("Xóa Tab này sẽ xóa sạch script bên trong đó?")) {
        let name = db.tabs[i].Name;
        db.tabs.splice(i, 1);
        db.scripts = db.scripts.filter(s => s.tab !== name);
        render();
    }
}

function addS(tabName) {
    let n = prompt(`Tên script mới cho [${tabName}]:`);
    if(n) {
        db.scripts.push({
            name: n,
            tab: tabName,
            img: DEF,
            script: "",
            describe: "",
            ratio: "ratio-1-1"
        });
        render();
        openE(db.scripts.length - 1);
    }
}

function delS(i) {
    if(confirm("Xóa script này?")) {
        db.scripts.splice(i, 1);
        document.getElementById('main').style.display = 'none';
        render();
    }
}

function setRatio() {
    let r = prompt("Chọn tỉ lệ card:\n1. Vuông (1:1)\n2. Ngang (16:9)\n3. Dọc (9:16)", "1");
    if(r === "1") db.scripts[curI].ratio = "ratio-1-1";
    else if(r === "2") db.scripts[curI].ratio = "ratio-16-9";
    else if(r === "3") db.scripts[curI].ratio = "ratio-9-16";
}

function getLS() {
    const ls = `loadstring(game:HttpGet("${API}/get-hub"))()`;
    navigator.clipboard.writeText(ls);
    alert("Đã copy Loadstring!");
}
