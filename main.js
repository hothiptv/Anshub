async function connect(){
  const player = document.getElementById("name").value
  const res = await fetch("/api/request",{
    method:"POST",
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({player})
  }).then(r=>r.json())

  if(!res.ok){
    status.innerText="Người chơi chưa bật script"
  }else{
    status.innerText="ID: "+res.id+" – chờ xác nhận"
  }
}
