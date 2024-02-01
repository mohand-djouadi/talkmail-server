const jwt = require('jsonwebtoken');

// Fonction pour générer un token JWT
const generateToken = (id) => {
  // Utilisation de la méthode sign de jwt pour créer un token
  // Le token contient une payload avec l'ID de l'utilisateur
  // La clé secrète 'talkmail' est utilisée pour signer le token
  // Le token expirera après 30 jours (30d)
  return jwt.sign({ id }, 'talkmail', {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
