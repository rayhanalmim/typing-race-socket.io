const express = require("express");

const cors = require("cors");

const socketHandler = require("./sockets/socketHandler");

const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.get("/", (req, res) => {
  res.send("Serverless Express is running on Vercel!");
});

// Initialize socket handlers
socketHandler(io);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
