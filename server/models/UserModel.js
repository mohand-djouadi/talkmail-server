const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

//modeliser les schemas de notre bdd
const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  dateofbirth: { type: Date },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (value) {
        // cette fonction est utilisée comme validateur
        // return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); // un modèle spécifique d'adresse email
        // [^\s@] tous les caracteres sauf les espaces et @
        return /^[^\s@]+@talkmail\.dz$/.test(value);
      },
      message: 'Veuillez entrer une adresse email valide de talkmail.dz .',
    },
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        // Cette fonction est utilisée comme validateur
        return /^.{8,}$/.test(value);
        // Vérifie que le mot de passe a au moins 8 caractères
        if (!/^.{8,}$/.test(value)) {
          return false;
        }
        // Vérifie qu'au moins un caractère est une majuscule
        const majuscules = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (!/[A-Z]/.test(value)) {
          return false;
        }

        // Vérifie qu'au moins un caractère est un chiffre
        const chiffres = '0123456789';
        if (!/[0-9]/.test(value)) {
          return false;
        }

        return true;
      },
      message:
        'Veuillez entrer un mot de passe contenant au moins 8caractéres incluant une majuscule au moins et un chiffre au minimum.',
    },
  },
  isAdmin: { type: Boolean, default: false },
  securityQuestion: { type: String },
  securityAnswer: { type: String },
  isResettingPassword: { type: Boolean, default: false },
  secureMail: {
    type: String,
    // required: true,
    select: true,
    validate: {
      validator: function (value) {
        // cette fonction est utilisée comme validateur
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); // un modèle spécifique d'adresse email
        // [^\s@] tous les caracteres sauf les espaces et @
      },
      message: 'Veuillez entrer une adresse email valide.',
    },
  },
  twoFA: { type: Boolean, default: false },
  otp: {
    code: {
      type: String,
      select: true, // Ne pas sélectionner par défaut pour des raisons de sécurité
    },
    expiresAt: {
      type: Date,
      select: true,
    },
  },
  pic: {
    type: String,
    required: true,
    default:
      'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
  },
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const expirationTime = new Date();
expirationTime.setSeconds(expirationTime.getSeconds() + 30000);

// Mise à jour de l'OTP et de sa date d'expiration dans la base de données
this.otp = {
  expiresAt: expirationTime,
};

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

userSchema.pre('save', async function (next) {
  if (!this.isModified) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
module.exports = User;
