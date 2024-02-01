const express = require('express');
const User = require('../models/UserModel');
const Event = require('../models/EventsModel');
const asyncHandler = require('express-async-handler');

const createEvent = asyncHandler(async (req, res) => {
  try {
    // l'utilisateur est authentifi ?
    if (!req.user) {
      return res
        .status(401)
        .json({ error: 'L utilisateur nest pas authentifié' });
    }

    const eventData = req.body;
    eventData.user = req.user._id;

    const event = await Event.create(eventData);
    res.status(201).json({ event });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de levent' });
  }
});

const getAllEvents = asyncHandler(async (req, res) => {
  try {
    // l'utilisateur est authentifi ?
    if (!req.user) {
      return res
        .status(401)
        .json({ error: 'Lutilisateur nest pas authentifié' });
    }

    const events = await Event.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json(events);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Erreur lors de la récupération des events' });
  }
});

const updateEvent = asyncHandler(async (req, res) => {
  try {
    // l'utilisateur est authentifié ?
    if (!req.user) {
      return res
        .status(401)
        .json({ error: 'Lutilisateur nest pas authentifié' });
    }

    const eventId = req.params.id;
    const eventData = req.body;

    // vérifie si on a l'événement de l'utilisateur
    const existEvent = await Event.findOne({
      _id: eventId,
      user: req.user._id,
    });

    if (!existEvent) {
      return res.status(404).json({
        error:
          'Event non trouvé ou vous navez pas l autorisation de le modifier',
      });
    }

    // update
    const updatedEvent = await Event.findByIdAndUpdate(eventId, eventData, {
      new: true,
    });

    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la MaJ de ev' });
  }
});

const deleteEvent = asyncHandler(async (req, res) => {
  try {
    // l'utilisateur est authentifi ?
    if (!req.user) {
      return res
        .status(401)
        .json({ error: 'Lutilisateur nest pas authentifié' });
    }

    const eventId = req.params.id;

    // verfi si on a levent d user
    const existEvent = await Event.findOne({
      _id: eventId,
      user: req.user._id,
    });

    if (!existEvent) {
      return res.status(404).json({
        error:
          'Event non trouvé ou vous navez pas l autorisation de l supprimer',
      });
    }

    // supprim l'événement
    const deletedEvent = await Event.findByIdAndDelete(eventId);

    res.status(200).json({ message: 'Event supprimé avec succès' });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la suppression de l'événement" });
  }
});

module.exports = { createEvent, getAllEvents, deleteEvent, updateEvent };
