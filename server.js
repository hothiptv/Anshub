const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const app = express();

app.use(express.json());
app.use(express.static("public"));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let waitingPlayers = {}; // username -> ws
let sessions = {};       // id -> { user, robloxWs, webWs }

function genId() {
  return "ans-" + Math.random().toString(36).slice(2, 8);
}

wss.on("connection", ws => {
  ws.on("message", msg => {
    let data = JSON.parse(msg);

    // Roblox báo đang chờ
    if (data.type === "roblox_wait") {
      waitingPlayers[data.username] = ws;
      ws.username = data.username;
    }

    // Web yêu cầu kết nối
    if (data.type === "web_request") {
      let robloxWs = waitingPlayers[data.username];
      if (!robloxWs) {
        ws.send(JSON.stringify({ type: "error", msg: "Người chơi chưa bật script" }));
        return;
      }

      let id = genId();
      sessions[id] = { user: data.username, robloxWs, webWs: ws };

      ws.send(JSON.stringify({ type: "pending", id }));
      robloxWs.send(JSON.stringify({ type: "confirm", id }));
    }

    // Roblox xác nhận
    if (data.type === "roblox_accept") {
      let s = sessions[data.id];
      if (!s) return;
      s.webWs.send(JSON.stringify({ type: "connected", id: data.id }));
    }

    if (data.type === "roblox_reject") {
      let s = sessions[data.id];
      if (!s) return;
      s.webWs.send(JSON.stringify({ type: "rejected" }));
      delete sessions[data.id];
    }
  });

  ws.on("close", () => {
    if (ws.username) delete waitingPlayers[ws.username];
  });
});

server.listen(process.env.PORT || 3000);
