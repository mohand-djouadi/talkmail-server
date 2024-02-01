const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/UserModel');

// Middleware pour protéger certaines routes en vérifiant la validité du token JWT
// Ce middleware est utilisé pour sécuriser les routes qui nécessitent une authentification
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Vérifie si l'entête Authorization contient un token JWT
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Récupère le token à partir de l'entête
      token = req.headers.authorization.split(' ')[1];

      // Vérifie la validité du token et décrypte son contenu
      const decoded = jwt.verify(token, 'talkmail');

      // Récupère les informations de l'utilisateur associées à l'ID extrait du token
      req.user = await User.findById(decoded.id).select('-password');
      // Passe à la prochaine fonction middleware ou route
      next();
    } catch (error) {
      // En cas d'erreur (token invalide ou expiré), renvoie une réponse 401 (Non autorisé)
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  // Si aucun token n'est présent dans l'entête, renvoie une réponse 401 (Non autorisé)
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

module.exports = { protect };
