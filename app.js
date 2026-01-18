const ws = new WebSocket(`wss://${location.host}`);

function connect() {
  let name = document.getElementById("name").value;
  ws.send(JSON.stringify({ type: "web_request", username: name }));
}

ws.onmessage = e => {
  let d = JSON.parse(e.data);
  document.getElementById("status").innerText = JSON.stringify(d);
};
