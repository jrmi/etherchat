var nanoid = require('nanoid').nanoid;
var express = require('express');
const path = require('path');
const Datastore = require('nedb');

var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

const port = process.env.PORT || 4000;

app.use(express.static(path.join(__dirname, '../build')));

// An api endpoint that returns a short list of items
app.get('/api/getMessage/', (req, res) => {
  var list = ['item1', 'item2', 'item3'];
  res.json(list);
  console.log('Sent list of items');
});

// Handles any requests that don't match the ones above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

http.listen(port, () => {
  console.log(`listening on *:${port}`);
});

const rooms = {};
const roomDBs = {};

io.on('connection', (socket) => {
  socket.on('join', (roomName) => {
    if (rooms[roomName] === undefined) {
      rooms[roomName] = [];
    }
    if (roomDBs[roomName] === undefined) {
      roomDBs[roomName] = new Datastore({
        filename: `data/${roomName}.db`,
        autoload: true,
      });
    }
    const userId = nanoid();
    rooms[roomName].push(userId);
    console.log(`User ${userId} join ${roomName}`);

    socket.join(roomName);
    socket.emit('yourid', { user: userId });

    roomDBs[roomName].find({}, (err, docs) => {
      socket.emit(
        'history',
        docs.map(({ content }) => content)
      );
    });

    // Send new user to all user of this room
    socket.broadcast.to(roomName).emit('incoming', { user: userId });

    socket.on('message', (newMessage) => {
      console.log('newMessage', newMessage);
      roomDBs[roomName].insert({ uid: nanoid(), content: newMessage });
      socket.emit('newMessage', newMessage);
      socket.broadcast.to(roomName).emit('newMessage', newMessage);
    });

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`);
      rooms[roomName] = rooms[roomName].filter((id) => id === userId);
    });
  });
});
