const ws = new WebSocket(`wss://${location.host}`);

const Home = add.tab("Home");

Home.button("Copy link", () => {
  navigator.clipboard.writeText(location.href);
});

Home.toggle("ESP", true);
Home.slider("Speed", 16, 100);
Home.input("Player");
Home.list("Players", ["A", "B", "C"]);
