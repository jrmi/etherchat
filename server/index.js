var nanoid = require('nanoid').nanoid;
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

const port = process.env.PORT || 4000;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '../build/index.html');
});

http.listen(port, () => {
  console.log(`listening on *:${port}`);
});

const rooms = {};

io.on('connection', (socket) => {
  console.log('New user connected');
  socket.on('join', (roomName) => {
    if (rooms[roomName] === undefined) {
      rooms[roomName] = [];
    }
    const userId = nanoid();
    rooms[roomName].push(userId);
    console.log(`User ${userId} join ${roomName}`);

    socket.join(roomName);
    socket.emit('yourid', { user: userId });

    // Send new user to all user of this room
    socket.broadcast.to(roomName).emit('incoming', { user: userId });

    socket.on('message', (newMessage) => {
      console.log('newMessage', newMessage);
      socket.emit('newMessage', newMessage);
      socket.broadcast.to(roomName).emit('newMessage', newMessage);
    });

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`);
      rooms[roomName] = rooms[roomName].filter((id) => id === userId);
    });
  });
});
