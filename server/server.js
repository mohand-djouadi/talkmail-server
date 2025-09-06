const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/UserRoutes');
const chatRoutes = require('./routes/chatRoutes');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const messageRoutes = require('./routes/messageRoutes');
// const mailRoutes = require('./routes/MailRoutes');
const mailRouteSI = require('./routes/mailRouteSI');
const mailBoxRoutes = require('./routes/mailBoxRoutes');
const EventsRoute = require('./routes/EventsRoute');
const path = require('path');

const app = express();
dotenv.config();
connectDB();

const corsOptions = {
  origin: '*', // Remplace par l'URL que tu veux autoriser
  credentials: true, // Si tu utilises des cookies ou des headers d'authentification
};

app.use(cors(corsOptions));

const PORT = process.env.PORT || 4001;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is runninggg');
});

app.use('/uploads', express.static(path.resolve(__dirname, 'server/config/uploads')));



app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
// creer une api pour l'envoi des messages
app.use('/api/message', messageRoutes);
app.use('/api/mail', mailRouteSI);
app.use('/api/retrieve', mailBoxRoutes);
app.use('/api/agenda', EventsRoute);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, "0.0.0.0", console.log(`Server started at ${PORT}`));

const io = require('socket.io')(server, {
  pingTimeout: 60000,
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  console.log('connected to socket io');
  socket.emit('me', socket.id);

  socket.on('disconnect', () => {
    socket.broadcast.emit('call ended');
  });

  socket.on('calluser', ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit('calluser', { signal: signalData, from, name });
  });

  socket.on('answercall', (data) => {
    io.to(data.to).emit('callaccepted', data.signal);
  });

  socket.on('setup', (userData) => {
    socket.join(userData._id);
    console.log(userData._id);
    socket.emit('connected');
  });

  socket.on('join chat', (room) => {
    socket.join(room);
    console.log('user joined room' + room);
  });

  socket.on('typing', (room) => socket.in(room).emit('typing'));
  socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));
  socket.on('new message', (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) {
      return console.log('chat.users not defined');
    }

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit('message recieved', newMessageRecieved);
    });
  });

  //     socket.off("setup", () => {
  //     console.log("USER DISCONNECTED");
  //     socket.leave(userData._id);
  //   });
});
