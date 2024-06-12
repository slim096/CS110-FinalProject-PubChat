const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  room: { type: String, required: true },
  username: { type: String, required: true },
  content: { type: String, required: true },
  time: { type: String, default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } // Format to 'hh:mm AM/PM'
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
