// Server-side code (server.js)
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// To enable HTTPS with a certificate.
//const options = {
//  key: fs.readFileSync('/path/to/privkey.pem'),
//  cert: fs.readFileSync('/path/to/fullchain.pem')
// };
d


const httpServer = createServer(app);
// With HTTPS use the below instead
// const httpServer = createServer(options, app);

// Simplified Socket.io setup
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Basic route for testing
app.get('/test', (req, res) => {
  res.send('Server is running!');
});

// Socket.IO chat logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join room', ({ username, room }) => {
    if (socket.data.room) {
      socket.leave(socket.data.room);
    }
    
    socket.data.username = username;
    socket.data.room = room;
    socket.join(room);
    console.log(`${username} joined ${room}`);
    io.to(room).emit('system message', `${username} has joined ${room}.`);
  });

  socket.on('chat message', (message) => {
    if (socket.data.room) {
      io.to(socket.data.room).emit('chat message', {
        username: socket.data.username,
        message: message,
      });
    }
  });

  socket.on('disconnect', () => {
    if (socket.data.username && socket.data.room) {
      io.to(socket.data.room).emit('system message', `${socket.data.username} has left ${socket.data.room}.`);
    }
    console.log('User disconnected:', socket.id);
  });
});

const port = process.env.PORT || 1919;
httpServer.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
