const express = require('express');
const User = require('../models/UserModel');
const MailBoxModel = require('../models/MailBoxModel');
const asyncHandler = require('express-async-handler');

// les retrouvailles des mails et les classer chaque yiwen ds sa mailbox
// ainsi creer une comme convenu et expliquer la derniere fois
// ihqa sync handler c pour controller et localiser anda thella l erreur
const retrieveMails = asyncHandler(async (req, res) => {
  const currentuser = req.user;
  try {
    // recuper user id des param d req
    const { userId } = req.params;
    // et ca c pour specefier le mailbox que je veux afficher son contenu
    const { mailbox } = req.query;
    // does he exist ??
    const user = await User.findById(userId);
    if (!user) {
      // no he doesn't ;p
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    // classement des mails par ordre descendant de plu recent
    // puis je l fai appl lors d'affichage d donnees
    function sortMailsByCreatedAt(mails) {
      return mails.sort((a, b) => b.createdAt - a.createdAt);
    }
    // i used let machi const
    //let box = 'inbox'; nezmer daghen aka :p mais non
    //je cree une var ismis oubox
    // si elle existe hamdullah on populate its datas sinon on la cree tt simplement
    let outbox = await MailBoxModel.findOne({
      userId: user._id,
      name: 'Outbox',
    }).populate({
      path: 'mails',
      match: { bin: { $ne: true } },
      populate: [
        {
          path: 'from',
          select: 'firstname lastname email pic',
        },
        {
          path: 'to',
          select: 'firstname lastname email pic',
        },
        {
          path: 'attachments',
        },
      ],
    });
    // otherwise on la creer et lui donner son name
    if (!outbox) {
      outbox = await MailBoxModel.create({
        userId: user._id,
        name: 'Outbox',
        mails: [],
      });
    }
    // wlh c la meme chose daki
    let inbox = await MailBoxModel.findOne({
      userId: user._id,
      name: 'Inbox',
    }).populate({
      path: 'mails',
      match: { bin: { $ne: true } },
      populate: [
        {
          path: 'from',
          select: 'firstname lastname email pic',
        },
        {
          path: 'to',
          select: 'firstname lastname email pic',
        },
        {
          path: 'attachments',
        },
      ],
    });

    if (!inbox) {
      inbox = await MailBoxModel.create({
        userId: user._id,
        name: 'Inbox',
        mails: [],
      });
    }

    let starred = await MailBoxModel.findOne({
      userId: user._id,
      name: 'Starred',
    }).populate({
      path: 'mails',
      match: { bin: { $ne: true } },
      populate: [
        {
          path: 'from',
          select: 'firstname lastname email',
        },
        {
          path: 'to',
          select: 'firstname lastname email',
        },
        {
          path: 'attachments',
        },
      ],
    });

    if (!starred) {
      starred = await MailBoxModel.create({
        userId: user._id,
        name: 'Starred',
        mails: [],
      });
    }

    let important = await MailBoxModel.findOne({
      userId: user._id,
      name: 'Important',
    }).populate({
      path: 'mails',
      match: { bin: { $ne: true } },
      populate: [
        {
          path: 'from',
          select: 'firstname lastname email',
        },
        {
          path: 'to',
          select: 'firstname lastname email',
        },
        {
          path: 'attachments',
        },
      ],
    });

    if (!important) {
      important = await MailBoxModel.create({
        userId: user._id,
        name: 'Important',
        mails: [],
      });
    }

    let bin = await MailBoxModel.findOne({
      userId: user._id,
      name: 'Bin',
    }).populate({
      path: 'mails',
      populate: [
        {
          path: 'from',
          select: 'firstname lastname email',
        },
        {
          path: 'to',
          select: 'firstname lastname email',
        },
        {
          path: 'attachments',
        },
      ],
    });

    if (!bin) {
      bin = await MailBoxModel.create({
        userId: user._id,
        name: 'Bin',
        mails: [],
      });
    }

    let drafts = await MailBoxModel.findOne({
      userId: user._id,
      name: 'Drafts',
    }).populate({
      path: 'mails',
      match: { bin: { $ne: true } },
      populate: [
        {
          path: 'from',
          select: 'firstname lastname email',
        },
        {
          path: 'to',
          select: 'firstname lastname email',
        },
        {
          path: 'attachments',
        },
      ],
    });

    if (!drafts) {
      drafts = await MailBoxModel.create({
        userId: user._id,
        name: 'Drafts',
        mails: [],
      });
    }

    let selectedMailbox;
    switch (mailbox) {
      case 'outbox':
        selectedMailbox = sortMailsByCreatedAt(outbox.mails);
        break;
      case 'inbox':
        selectedMailbox = sortMailsByCreatedAt(inbox.mails);
        break;
      case 'starred':
        selectedMailbox = sortMailsByCreatedAt(starred.mails);
        break;
      case 'important':
        selectedMailbox = sortMailsByCreatedAt(important.mails);
        break;
      case 'bin':
        selectedMailbox = sortMailsByCreatedAt(bin.mails);
        break;
      case 'drafts':
        selectedMailbox = sortMailsByCreatedAt(drafts.mails);
        break;
      default:
        return res
          .status(400)
          .json({ error: 'Mailbox non spécifié ou invalide' });
    }

    res.status(200).json({ [mailbox]: selectedMailbox });
  } catch (error) {
    res.status(500).json({ error: error.message }); // yellis tfamilt thaki x)
  }
});

module.exports = { retrieveMails };
