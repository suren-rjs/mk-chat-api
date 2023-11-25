const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

mongoose.connect('mongodb+srv://suren:Mnitp9FllexeWdLd@e-store.grvfvbc.mongodb.net/mk-chat-db?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const MessageSchema = new mongoose.Schema({
  id: String,
  createdDate: Date,
  message: String,
  status: String,
  spaceId: String,
  channelId: String,
  isDeletedFromSender: Boolean,
  isEditedMessage: Boolean,
  mentionedMessageId: String,
  recepientId: String,
  media: Array,
  recipients: Array,
  readers: Array,
});

const SpaceSchema = new mongoose.Schema({
  id: String,
  channel: String,
  sender: String,
  receiver: String,
  isBlocked: String,
  isSilent: String
});

const ChannelSchema = new mongoose.Schema({
  id: String,
  name: String,
  members: Array,
});

const Messages = mongoose.model('Messages', MessageSchema);
const Space = mongoose.model('Space', SpaceSchema);
const Channel = mongoose.model('Channel', SpaceSchema);

app.use(bodyParser.json());

// Space CRUD

app.post('/space/create', async (req, res) => {
  const space = await Space.create(req.body);
  res.json(space);
});

app.get('/spaces', async (req, res) => {
  const space = await Space.find();
  res.json(space);
});

app.put('/space/update/:id', async (req, res) => {
  const space = await Space.findByIdAndUpdate(req.params.id, req.body);
  res.json(space);
});

app.delete('/space/delete/:id', async (req, res) => {
  try {
    await Space.findByIdAndDelete(req.params.id);
    res.json({ message: 'Space deleted successfully' });
  } catch (error) {
    res.json({ message: 'Invalid id' });
  }
});

// In Person Message CRUD

app.post('/message/space/:id', async (req, res) => {
  let msg = req.body;
  msg.spaceId = req.params.id;
  msg.status = "Send";
  const message = await Messages.create(msg);
  res.json(message);
});

app.get('/message/space/:id', async (req, res) => {
  let query = { spaceId: req.params.id };
  const sort = { length: -1 };
  const messages = await Messages.find(query).sort(sort);
  res.json(messages);
})

app.delete('/message/space/:id', async (req, res) => {
  let msg = await Messages.findById(req.params.id);
  msg.isDeletedFromSender = true;
  msg.status = "Deleted";
  const message = await Messages.findByIdAndUpdate(req.params.id, msg);
  res.json({ message: "Message Deleted !" });
});

app.put('/message/space/:id/:status', async (req, res) => {
  try {
    let msg = await Messages.findById(req.params.id);

    if (!msg) {
      return res.status(404).json({ error: 'Message not found' });
    }

    msg.isDeletedFromSender = true;
    msg.status = req.params.status;

    const updatedMessage = await Messages.findByIdAndUpdate(req.params.id, msg, { new: true });

    res.json(updatedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Channel Message CRUD

app.post('/message/channel/:id', async (req, res) => {
  let channel = await Channel.findById(req.params.id);
  let msg = req.body;
  msg.channelId = req.params.id;
  msg.recipients = channel.recipients;
  msg.status = "Send";
  const message = await Messages.create(msg);
  res.json(message);
});

app.get('/message/channel/:id', async (req, res) => {
  let query = { spaceId: req.params.id };
  const sort = { length: -1 };
  const messages = await Messages.find(query).sort(sort);
  res.json(messages);
})

app.delete('/message/channel/:id', async (req, res) => {
  let msg = await Messages.findById(req.params.id);
  msg.isDeletedFromSender = true;
  msg.status = "Deleted";
  const message = await Messages.findByIdAndUpdate(req.params.id, msg);
  res.json({ message: "Message Deleted !" });
});

app.put('/message/channel/:id/:status/:userId', async (req, res) => {
  try {
    let msg = await Messages.findById(req.params.id);

    if (!msg) {
      return res.status(404).json({ error: 'Message not found' });
    }

    msg.isDeletedFromSender = true;
    msg.status = req.params.status;
    msg.readers.push(req.params.userId);

    const updatedMessage = await Messages.findByIdAndUpdate(req.params.id, msg, { new: true });

    res.json(updatedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/', async (req, res) => {
  res.json({ message: "mk-chat-api is running" });
});

app.listen(3000, () => {
  console.log('App listening on port 3000');
});