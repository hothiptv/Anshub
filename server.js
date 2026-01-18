const express = require("express");
const { WebSocketServer } = require("ws");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.static("public"));

const server = app.listen(process.env.PORT || 3000);
const wss = new WebSocketServer({ server });

/*
playerName => {
  socket,
  id,
  accepted
}
*/
let waitingPlayers = {};

wss.on("connection", ws => {
  ws.on("message", msg => {
    let data = JSON.parse(msg);

    // Roblox đăng ký chờ kết nối
    if (data.type === "roblox_wait") {
      const id = "ans-" + uuidv4().slice(0, 6);
      waitingPlayers[data.player] = {
        socket: ws,
        id,
        accepted: false
      };

      ws.send(JSON.stringify({
        type: "waiting",
        id
      }));
    }

    // Web yêu cầu kết nối
    if (data.type === "web_request") {
      const target = waitingPlayers[data.player];
      if (!target) {
        ws.send(JSON.stringify({
          type: "error",
          msg: "Người chơi chưa bật script"
        }));
        return;
      }

      target.socket.send(JSON.stringify({
        type: "confirm",
        id: target.id
      }));

      ws.send(JSON.stringify({
        type: "pending",
        id: target.id
      }));
    }

    // Roblox chấp nhận
    if (data.type === "roblox_accept") {
      for (let p in waitingPlayers) {
        if (waitingPlayers[p].id === data.id) {
          waitingPlayers[p].accepted = true;
          waitingPlayers[p].socket.send(JSON.stringify({
            type: "connected"
          }));
        }
      }
    }
  });
});

console.log("ANSHUB SERVER ONLINE");
