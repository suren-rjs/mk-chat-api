const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const app = express()

mongoose.connect('mongodb+srv://suren:Mnitp9FllexeWdLd@e-store.grvfvbc.mongodb.net/mk-chat-db?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection

db.on('error', console.error.bind(console, 'MongoDB connection error:'))
db.once('open', () => {
  console.log('Connected to MongoDB')
})

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
  senderId: String,
  media: Array,
  recipients: Array,
  readers: Array
})

const SpaceSchema = new mongoose.Schema({
  id: String,
  channel: String,
  sender: String,
  receiver: String,
  isBlocked: String,
  isSilent: String
})

const ChannelSchema = new mongoose.Schema({
  id: String,
  name: String,
  members: Array
})

const UserSchema =  new mongoose.Schema({
  username:String,
  channelId:String 
})

const Messages = mongoose.model('Messages', MessageSchema)
const Space = mongoose.model('Space', SpaceSchema)
const Channel = mongoose.model('Channel', ChannelSchema)
const User = mongoose.model('user', UserSchema)

app.use(bodyParser.json())

// Space CRUD

app.post('/space/create', async (req, res) => {
  let message = req.body;
  let id = message.sender + "-" + message.receiver
  message.id = id
  const space = await Space.create(message)
  res.json(space)
})

app.get('/spaces', async (req, res) => {
  const space = await Space.find()
  res.json(space)
})

app.put('/space/update/:id', async (req, res) => {
  const space = await Space.findByIdAndUpdate(req.params.id, req.body)
  res.json(space)
})

app.delete('/space/delete/:id', async (req, res) => {
  try {
    await Space.findByIdAndDelete(req.params.id)
    res.json({ message: 'Space deleted successfully' })
  } catch (error) {
    res.json({ message: 'Invalid id' })
  }
})

// In Person Message CRUD

app.post('/message/space/:id', async (req, res) => {
  try {
    const msg = req.body
    msg.spaceId = req.params.id
    msg.status = 'Send'
    msg.createdDate = new Date()
    const message = await Messages.create(msg)
    res.json(message)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.get('/message/space/:id', async (req, res) => {
  const query = { spaceId: req.params.id }
  const sort = { length: -1 }
  const messages = await Messages.find(query).sort(sort)
  res.json(messages)
})

app.delete('/message/space/:id', async (req, res) => {
  const msg = await Messages.findById(req.params.id)
  msg.isDeletedFromSender = true
  msg.status = 'Deleted'
  await Messages.findByIdAndUpdate(req.params.id, msg)
  res.json({ message: 'Message Deleted !' })
})

app.put('/message/space/:id/:status', async (req, res) => {
  try {
    const msg = await Messages.findById(req.params.id)

    if (!msg) {
      return res.status(404).json({ error: 'Message not found' })
    }

    msg.isDeletedFromSender = false
    msg.status = req.params.status

    const updatedMessage = await Messages.findByIdAndUpdate(req.params.id, msg, { new: true })

    res.json(updatedMessage)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

// Channel Message CRUD

app.post('/message/channel/:id', async (req, res) => {
  const channel = await Channel.findById(req.params.id)
  const msg = req.body
  msg.channelId = req.params.id
  msg.recipients = channel.recipients
  msg.status = 'Send'
  const message = await Messages.create(msg)
  res.json(message)
})

app.get('/message/channel/:id', async (req, res) => {
  const query = { spaceId: req.params.id }
  const sort = { length: -1 }
  const messages = await Messages.find(query).sort(sort)
  res.json(messages)
})

app.delete('/message/channel/:id', async (req, res) => {
  const msg = await Messages.findById(req.params.id)
  msg.isDeletedFromSender = true
  msg.status = 'Deleted'
  await Messages.findByIdAndUpdate(req.params.id, msg)
  res.json({ message: 'Message Deleted !' })
})

app.put('/message/channel/:id/:status/:userId', async (req, res) => {
  try {
    const msg = await Messages.findById(req.params.id)

    if (!msg) {
      return res.status(404).json({ error: 'Message not found' })
    }

    msg.isDeletedFromSender = true
    msg.status = req.params.status
    msg.readers.push(req.params.userId)

    const updatedMessage = await Messages.findByIdAndUpdate(req.params.id, msg, { new: true })

    res.json(updatedMessage)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

// User CRUD

app.post('/user/subscribe/:id', async (req, res) => {
  const user = req.body
  user.channelId = req.params.id
  const userChannel = await User.create(user)
  res.json(userChannel)
})

app.get('/user/subcriptions/:id', async (req, res) => {
  const query = { username: req.params.id }
  const sort = { length: -1 }
  const userChannels = await User.find(query).sort(sort)
  res.json(userChannels)
})

app.delete('/user/unsubscribe/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id)
  res.json({ message: 'Channel Deleted !' })
})

app.get('/', async (req, res) => {
  res.json({ message: 'mk-chat-api is running' })
})

app.listen(3000, () => {
  console.log('App listening on port 3000')
})
