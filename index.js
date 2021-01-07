const express = require('express');
const { format } = require('path');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*'
  }
});
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Welcome to ChatDevelop');
});

io.on('connection', (socket) => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    socket.emit('message', formatMessage('ChatBot', 'Welcome to ChatDevelop!'));

    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage('ChatBot', `${user.username} has joined the chat`)
      );

    io.to(user.room).emit('roomUsers', getRoomUsers(user.room));
  });

  socket.on('chatMessage', (message) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('message', formatMessage(user.username, message));
  });

  socket.on('disconnect', () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage('ChatBot', `${user.username} has left the chat`)
      );

      io.to(user.room).emit('roomUsers', getRoomUsers(user.room));
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is up and running on Port ${PORT}`);
});
