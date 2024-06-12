const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  isNewUser: { type: Boolean, default: false }, // Add isNewUser field
  bio: { type: String, maxLength: 150 }
});

const chatUserSchema = new mongoose.Schema({
  socketId: String,
  username: { type: String, required: true },
  room: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);
const ChatUser = mongoose.model('ChatUser', chatUserSchema);

async function getUserByUsername(username) {
  return User.findOne({ username });
}

async function createUser(user) {
  const newUser = new User(user);
  return newUser.save();
}

async function getUserByGoogleId(googleId) {
  return User.findOne({ googleId });
}

async function updateUserBio(username, bio) {
  return User.findOneAndUpdate({ username }, { bio }, { new: true });
}

module.exports = { getUserByUsername, createUser, getUserByGoogleId, updateUserBio, User, ChatUser };