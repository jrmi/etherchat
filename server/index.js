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
  socket.on('join', ({ room: roomName, user: { name, uid }, user }) => {
    if (rooms[roomName] === undefined) {
      rooms[roomName] = [];
    }
    if (roomDBs[roomName] === undefined) {
      roomDBs[roomName] = new Datastore({
        filename: `data/${roomName}.db`,
        autoload: true,
      });
    }
    rooms[roomName].push(user);
    console.log(`User ${name}<${uid}> join ${roomName}`);

    socket.join(roomName);

    roomDBs[roomName]
      .find({})
      .sort({ uid: 1 })
      .exec((err, docs) => {
        socket.emit(
          'history',
          docs.map(({ content }) => content)
        );
      });

    // Send new user to all user of this room
    socket.broadcast.to(roomName).emit('incoming', { user: { uid } });

    socket.on('message', (newMessage) => {
      console.log('newMessage', newMessage);
      roomDBs[roomName].count({}, (err, count) => {
        roomDBs[roomName].insert({ uid: count, content: newMessage });
      });
      // Emit new mesage event
      socket.emit('newMessage', newMessage);
      socket.broadcast.to(roomName).emit('newMessage', newMessage);
    });

    socket.on('updateUser', (modifiedUser) => {
      console.log('updateUser', modifiedUser);
      rooms[roomName] = rooms[roomName].map((connectedUser) => {
        if (connectedUser.uid === uid) {
          return modifiedUser;
        }
        return connectedUser;
      });
      // Send updated user list
      socket.emit('userListUpdate', rooms[roomName]);
      socket.broadcast.to(roomName).emit('userListUpdate', rooms[roomName]);
    });

    // Send updated user list
    socket.emit('userListUpdate', rooms[roomName]);
    socket.broadcast.to(roomName).emit('userListUpdate', rooms[roomName]);

    socket.on('disconnect', () => {
      // Handle disconnection
      console.log(`User ${name}<${uid}> disconnected`);
      rooms[roomName] = rooms[roomName].filter(
        ({ uid: connectedUid }) => connectedUid !== uid
      );
      socket.broadcast.to(roomName).emit('userListUpdate', rooms[roomName]);
    });
  });
});
