const express = require("express")
const app = express()
const path = require("path")

app.use(express.json())
app.use(express.static("public"))

let sessions = {} 
/*
sessions = {
  playerName: {
    status: "WAITING" | "PENDING" | "CONNECTED",
    id: "ans-xxxxx",
    serverId: "",
    lastPing: Date
  }
}
*/

function genId() {
  return "ans-" + Math.random().toString(36).substring(2,7).toUpperCase()
}

// Roblox báo đang bật script
app.post("/api/register", (req,res)=>{
  const { player, serverId } = req.body
  sessions[player] = {
    status: "WAITING",
    serverId,
    id: null,
    lastPing: Date.now()
  }
  res.json({ ok:true })
})

// Web nhập tên
app.post("/api/request", (req,res)=>{
  const { player } = req.body
  const s = sessions[player]
  if (!s) return res.json({ ok:false, msg:"PLAYER_OFFLINE" })

  s.id = genId()
  s.status = "PENDING"
  res.json({ ok:true, id:s.id })
})

// Roblox polling
app.get("/api/check/:player",(req,res)=>{
  const s = sessions[req.params.player]
  if (!s) return res.json({ status:"NONE" })
  res.json(s)
})

// Roblox chấp nhận
app.post("/api/accept",(req,res)=>{
  const { player } = req.body
  if (sessions[player]) sessions[player].status="CONNECTED"
  res.json({ ok:true })
})

// Hủy
app.post("/api/cancel",(req,res)=>{
  const { player } = req.body
  delete sessions[player]
  res.json({ ok:true })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, ()=>console.log("ANS HUB ONLINE"))
