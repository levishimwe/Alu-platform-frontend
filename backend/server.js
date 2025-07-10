// backend/server.js
const http = require("http");
const app = require("./app"); // Express app
const socketHandlers = require("./socket/socketHandlers");

const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: { origin: "*" },
});
socketHandlers(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
