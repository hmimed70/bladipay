const http = require('http');
require('dotenv').config();
const conncectDB = require('./config/db');
const app = require('./server');
const PORT = process.env.PORT || 8000 ;
//const { Server } = require('socket.io');
//const { socketConnectionHandler } = require('./SocketHandler');
const server = http.createServer(app);
/*
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL, // frontend URL
    methods: ["GET", "POST"]
  }
});
*/
conncectDB();
//app.set('socketio', io);
//socketConnectionHandler(io);



  server.listen(PORT, console.log(`server is running on port ${PORT}`));

  process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err}`);
  console.log(`Shutting down the server due to Unhandled Promise Rejection`);

  server.close(() => {
    process.exit(1);
  });
});
