const asyncHandler = require('express-async-handler');
const Chat = require('../models/chatModel');
const Message = require('../models/MessageModel');
const User = require('../models/UserModel');

// Cette fonction gère l'accès à une conversation individuelle
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  // Vérification de la présence de l'ID de l'utilisateur dans la requête
  if (!userId) {
    return res.sendStatus(400);
  }

  // Vérification si une conversation individuelle existe déjà entre l'utilisateur actuel et l'utilisateur ciblé
  var isChat = await Chat.find({
    isGroupChat: false,
    users: { $all: [req.user._id, userId] },
  })
    .populate('users', '-password') // Population des détails des utilisateurs sauf les mots de passe
    .populate('latestMessage'); // Population des détails du dernier message

  isChat = await User.populate(isChat, {
    path: 'latestMessage.sender',
    select: 'firstname lastname',
  });

  if (isChat.length > 0) {
    res.send(isChat[0]); // Retourne la conversation existante s'il y en a une
  } else {
    // Obtenez les détails de l'utilisateur invité
    const invitedUser = await User.findById(userId);

    // Construisez le chatName en utilisant le nom et le prénom de l'utilisateur invité
    const chatNamee = 'sender';
    // Crée un nouveau chat privé avec l'utilisateur connecté et
    // Si la conversation n'existe pas, elle est créée
    const chatData = {
      chatName: chatNamee,
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);

      // Récupération de la conversation créée avec les détails des utilisateurs (sauf les mots de passe)
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        'users',
        '-password',
      );

      res.status(200).send(FullChat); // Retourne la nouvelle conversation
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

// Cette fonction récupère toutes les conversations associées à l'utilisateur actuel
const fetchChats = asyncHandler(async (req, res) => {
  try {
    // Recherche de toutes les conversations dans lesquelles l'utilisateur actuel est impliqué
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate('users', '-password') // Population des détails des utilisateurs sauf les mots de passe
      .populate('groupAdmin', '-password') // Population des détails de l'administrateur de groupe
      .populate('latestMessage') // Population des détails du dernier message
      .sort({ updatedAt: -1 }) // Tri par date de mise à jour décroissante
      .then(async (results) => {
        results = await User.populate(results, {
          // Population des détails des utilisateurs dans le dernier message de chaque conversation
          path: 'latestMessage.sender',
          select: 'firstname lastname email',
        });
        res.status(200).send(results); // Retourne toutes les conversations associées à l'utilisateur
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// Cette fonction crée une nouvelle conversation de groupe
const createGroupChat = asyncHandler(async (req, res) => {
  // Verifie si les champs obligatoires sont presents dans le corps de la requete
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: 'please fill all the fields' });
  }

  // Convertit la chaine users en tableau
  var users = JSON.parse(req.body.users);

  // Verifie s'il y a au moins deux utilisateurs pour former un groupe
  if (users.length < 2) {
    return res.status(400).send('More than 2 users to form a group chat');
  }

  // Ajoute l'utilisateur actuel a la liste des utilisateurs
  users.push(req.user);

  try {
    // Cree un nouveau document de chat avec les donnees fournies
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    // Recupere le chat nouvellement cree avec les donnees utilisateur remplies (a l'exclusion du mot de passe)
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    // Envoie les donnees completes du chat de groupe dans la reponse
    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400); // Gere les erreurs lors des operations de base de donnees
    throw new Error(error.message);
  }
});

// fonction pour renommer un groupe
const renameGroup = asyncHandler(async (req, res) => {
  // Extrait l'ID du chat et le nouveau nom du corps de la requete
  const { chatId, chatName } = req.body;

  // Met a jour le document de chat avec le nouveau nom
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName,
    },
    {
      new: true, // Renvoie le document mis a jour
    },
  )
    .populate('users', '-password')
    .populate('groupAdmin', '-password');

  // Verifie si le document de chat a ete trouve et mis a jour
  if (!updatedChat) {
    res.status(404);
    throw new Error('Chat Not Found');
  } else {
    // Envoie les donnees du chat mis a jour dans la reponse
    res.json(updatedChat);
  }
});

// fonction pour ajouter un utilisateur au groupe
const addToGroup = asyncHandler(async (req, res) => {
  // Extrait l'ID du chat et l'ID de l'utilisateur du corps de la requete
  const { chatId, userId } = req.body;

  // Ajoute l'utilisateur au tableau d'utilisateurs du document de chat
  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId }, // Operateur MongoDB pour ajouter a un tableau
    },
    { new: true }, // Renvoie le document mis a jour
  )
    .populate('users', '-password')
    .populate('groupAdmin', '-password');

  // Verifie si l'utilisateur a ete ajoute avec succes
  if (!added) {
    res.status(400);
    throw new Error('chat not found');
  } else {
    // Envoie les donnees du chat mis a jour dans la reponse
    res.json(added);
  }
});

// fonction pour supprimer un utilisateur de groupe
const removeFromGroup = asyncHandler(async (req, res) => {
  // Extrait l'ID du chat et l'ID de l'utilisateur du corps de la requete
  const { chatId, userId } = req.body;

  // Retire l'utilisateur du tableau d'utilisateurs du document de chat
  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId }, // Operateur MongoDB pour retirer d'un tableau
    },
    { new: true }, // Renvoie le document mis a jour
  )
    .populate('users', '-password')
    .populate('groupAdmin', '-password');

  // Verifie si l'utilisateur a ete retire avec succes
  if (!removed) {
    res.status(400);
    throw new Error('chat not found');
  } else {
    // Envoie les donnees du chat mis a jour dans la reponse
    res.json(removed);
  }
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
