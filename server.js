require('dotenv').config();
const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const passport = require('./middlewares/passport');
const formatMessage = require("./utils/messages");
const userController = require('./controllers/userController');
const authMiddleware = require('./middlewares/auth');
const googleAuthRoutes = require('./controllers/googleAuthRoutes');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const MONGO_URI = process.env.MONGO_URI;
const SECRET_KEY = process.env.SECRET_KEY;

mongoose.connect(MONGO_URI, {}).then(() => {
  console.log('Connected to MongoDB database.');
}).catch(err => console.log(err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGO_URI }),
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

const { User, ChatUser } = require('./utils/users');
const Message = require('./utils/message');

let rooms = [];

const loadRooms = async () => {
  const distinctRooms = await ChatUser.distinct("room");
  rooms = distinctRooms;
};

loadRooms();

app.use('/', userController);
app.use('/', googleAuthRoutes);
app.use(express.static(path.join(__dirname, "public")));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/join', authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'join.html'));
});

app.get('/rooms', authMiddleware, (req, res) => {
  res.json({ rooms });
});

app.get('/chat', authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

const botName = "PubChat Bot";

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    console.log("Google callback received");
    if (req.user && req.user.isNewUser) {
      res.redirect('/set-username');
    } else {
      res.redirect('/join');
    }
  }
);

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

app.get('/env', (req, res) => {
  res.json({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
  });
});

io.on("connection", (socket) => {
  socket.on("joinRoom", async ({ username, room }) => {
    if (!username || !room) {
      return socket.emit("message", formatMessage(botName, "Username and room are required."));
    }

    if (!rooms.includes(room)) {
      rooms.push(room);
    }

    let user = await ChatUser.findOne({ username, room });

    if (user) {
      user.socketId = socket.id;
      await user.save();
    } else {
      user = new ChatUser({ socketId: socket.id, username, room });
      await user.save();
    }

    socket.join(user.room);

    const messageHistory = await Message.find({ room: user.room });
    socket.emit('messageHistory', messageHistory);

    socket.emit("message", formatMessage(botName, "Welcome to PubChat!"));

    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    const usersInRoom = await ChatUser.find({ room: user.room });
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: usersInRoom.map(user => ({ username: user.username })),
    });
  });

  socket.on("chatMessage", async (msg) => {
    const user = await ChatUser.findOne({ socketId: socket.id });

    if (user) {
      const message = new Message({ room: user.room, username: user.username, content: msg });
      await message.save();
      io.to(user.room).emit("message", {
        id: message._id.toString(),
        username: user.username,
        text: msg,
        time: message.time
      });
    } else {
      console.error('User not found');
      socket.emit("message", formatMessage(botName, "Error: user not found"));
    }
  });

  socket.on("editMessage", async ({ messageId, newContent }) => {
    try {
      const message = await Message.findById(messageId);
      if (message) {
        message.content = newContent;
        await message.save();
        io.to(message.room).emit('messageEdited', { messageId, newContent });
      }
    } catch (error) {
      console.error('Error editing message:', error);
    }
  });

  socket.on("deleteMessage", async ({ messageId }) => {
    try {
      const message = await Message.findByIdAndDelete(messageId);
      if (message) {
        io.to(message.room).emit('messageDeleted', { messageId });
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  });

  socket.on("leaveRoom", async ({ username, room }) => {
    const user = await ChatUser.findOneAndDelete({ socketId: socket.id, username, room });

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );

      const usersInRoom = await ChatUser.find({ room: user.room });
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: usersInRoom.map(user => ({ username: user.username })),
      });

      if (usersInRoom.length === 0) {
        await Message.deleteMany({ room: user.room });
        rooms = rooms.filter(r => r !== user.room);
      }

      socket.leave(room);
      socket.emit('leftRoom');
    }
  });

  socket.on("disconnect", async () => {
    const user = await ChatUser.findOneAndDelete({ socketId: socket.id });

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );

      const usersInRoom = await ChatUser.find({ room: user.room });
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: usersInRoom.map(user => ({ username: user.username })),
      });

      if (usersInRoom.length === 0) {
        await Message.deleteMany({ room: user.room });
        rooms = rooms.filter(r => r !== user.room);
      }
    }
  });
});

const PORT = 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
