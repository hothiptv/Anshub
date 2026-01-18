const TabLib = {
    tabs: {},
    
    // Tạo Tab mới
    createTab(tabName) {
        const sidebar = document.querySelector('.sidebar ul');
        const contentArea = document.querySelector('.content');

        // Thêm nút vào sidebar
        const navItem = document.createElement('li');
        navItem.innerText = tabName;
        navItem.onclick = () => this.showTab(tabName);
        sidebar.appendChild(navItem);

        // Thêm vùng chứa nội dung
        const tabPane = document.createElement('div');
        tabPane.id = `tab-${tabName.toLowerCase()}`;
        tabPane.className = 'tab-pane';
        tabPane.style.display = 'none';
        contentArea.appendChild(tabPane);

        this.tabs[tabName] = tabPane;
        return tabPane;
    },

    // Hàm add.button
    addButton(tabName, text, callback) {
        const btn = document.createElement('button');
        btn.className = 'ui-button';
        btn.innerText = text;
        btn.onclick = callback;
        this.tabs[tabName].appendChild(btn);
    },

    // Hàm add.toggle
    addToggle(tabName, text, callback) {
        const container = document.createElement('div');
        container.className = 'ui-toggle-container';
        container.innerHTML = `
            <span>${text}</span>
            <label class="switch">
                <input type="checkbox">
                <span class="slider round"></span>
            </label>
        `;
        container.querySelector('input').onchange = (e) => callback(e.target.checked);
        this.tabs[tabName].appendChild(container);
    },

    showTab(name) {
        document.querySelectorAll('.tab-pane').forEach(p => p.style.display = 'none');
        this.tabs[name].style.display = 'block';
    }
};

// Khởi tạo Home khi kết nối thành công
function initDefaultTabs() {
    TabLib.createTab("Home");
    TabLib.addButton("Home", "Sao chép Link Web", () => {
        navigator.clipboard.writeText("anshub-production.up.railway.app");
        alert("Đã sao chép!");
    });
    
    TabLib.createTab("Server");
    TabLib.createTab("Executor");
    TabLib.createTab("Settings");
}
