class TabUI {
  constructor(name) {
    this.name = name;
    this.container = document.createElement("div");
    this.container.className = "tab";
    document.getElementById("content").appendChild(this.container);
  }

  button(name, cb) {
    let btn = document.createElement("button");
    btn.innerText = name;
    btn.onclick = cb;
    this.container.appendChild(btn);
  }

  toggle(name, def) {
    let label = document.createElement("label");
    let input = document.createElement("input");
    input.type = "checkbox";
    input.checked = def;
    label.append(name, input);
    this.container.appendChild(label);
  }

  slider(name, min, max) {
    let input = document.createElement("input");
    input.type = "range";
    input.min = min;
    input.max = max;
    this.container.append(name, input);
  }

  input(name) {
    let i = document.createElement("input");
    i.placeholder = name;
    this.container.appendChild(i);
  }

  list(name, arr) {
    let select = document.createElement("select");
    arr.forEach(v => {
      let o = document.createElement("option");
      o.innerText = v;
      select.appendChild(o);
    });
    this.container.append(name, select);
  }
}

/* API GIỐNG BẠN YÊU CẦU */
window.add = {
  tab(name) {
    return new TabUI(name);
  }
};
