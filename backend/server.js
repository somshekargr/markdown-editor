// server.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server);
const marked = require("marked");

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("THIS IS MARKDOWN SERVER");
});

// socket connection for real time markdown conversion using marker package
io.on("connection", (socket) => {
  console.log("connected");

  socket.on("markdown", (markdown) => {
    // console.log(`Message: ${markdown}`);
    const htmlContent = marked.parse(markdown);
    // console.log(htmlContent);
    io.emit("html", htmlContent); 
  });

  socket.on("disconnect", () => {
    console.log("disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
