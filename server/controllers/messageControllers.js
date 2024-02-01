const asyncHandler = require('express-async-handler');
const Message = require('../models/MessageModel');
const User = require('../models/UserModel');
const Chat = require('../models/chatModel');

// controlleur pour envoyer un message
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;
  // s'il n'y a pas de message ni id de la discussion
  if (!content || !chatId) {
    return res.sendStatus(400);
  }

  // l'objet du nouveau message
  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage); //creer un nouveau message
    //remplir certain champs
    message = await message.populate('sender', 'firstname lastname');
    message = await message.populate('chat');
    //remplir le champs users dans le chat
    message = await User.populate(message, {
      path: 'chat.users', //indication du chemin
      select: 'firstname lastname email', //les champs a remplir
    });
    //remplacer le dernier message avec le prochain
    await Chat.findByIdAndUpdate(req.body.chatId, {
      //maj le dernier message
      latestMessage: message,
    });

    res.json(message);
  } catch (error) {
    throw new Error(error.message);
  }
});

// pour recuperer un message
const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', 'firstname lastname email')
      .populate('chat');

    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { sendMessage, allMessages };
