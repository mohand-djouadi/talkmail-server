const asyncHandler = require('express-async-handler');
const User = require('../models/UserModel');
const generateToken = require('../config/generateToken');

const MailModel = require('../models/MailModel');
const MailBoxModel = require('../models/MailBoxModel');
const bcrypt = require('bcryptjs');
// const nodemailer = require('nodemailer');

const genOTP = () => {
  const generatedOTP = Math.floor(1000 + Math.random() * 9000);
  const expirationTime = new Date();
  expirationTime.setTime(expirationTime.getTime() + 30000);

  return generatedOTP;
};

const OTP = async (user, generatedOTP) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'contact.isinnovate@gmail.com',
      pass: 'cotm ufbq xlyq byro',
    },
  });

  const mailOptions = {
    from: 'contact.isinnovate@gmail.com',
    to: user,
    subject: '2FA verification',
    html: `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>2FA verification</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  padding: 20px;
              }
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #ffffff;
                  padding: 20px;
                  border-radius: 5px;
                  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
              }
              h1 {
                  color: #333;
              }
              p {
                  font-size: 16px;
                  line-height: 1.5;
                  color: #666;
              }
              .otp {
                  font-size: 24px;
                  font-weight: bold;
                  color: #007bff;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>Two Factors Authentication</h1>
              <p>To complete your aythentication, please enter the OTP below:</p>
              <p>Your OTP is: <span class="otp">${generatedOTP}</span></p>
              <p>If you did not request this OTP, please ignore this email.</p>
          </div>
      </body>
      </html> 
      `,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('err de otp', error);
  }
};

// Cette fonction est destinée à l'inscription d'un nouvel utilisateur.
// Elle vérifie la présence des champs requis (firstname, lastname, email, password).
// Vérifie également si l'utilisateur avec l'e-mail donné existe déjà.
// Crée un nouvel utilisateur dans la base de données et renvoie une réponse avec les détails de l'utilisateur et un token d'authentification.

const registerUser = asyncHandler(async (req, res) => {
  // Extraction des données du corps de la requête
  const {
    firstname,
    lastname,
    dateofbirth,
    email,
    password,
    securityAnswer,
    securityQuestion,
    secureMail,
    pic,
  } = req.body;

  if (
    !firstname ||
    !lastname ||
    !dateofbirth ||
    !email ||
    !password ||
    !securityQuestion ||
    !securityAnswer ||
    !secureMail
  ) 
  {
    res.status(400);
    throw new Error('Please enter all the fields');
  }

  // Vérification si l'utilisateur existe déjà dans la base de données
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Création de l'utilisateur dans la base de données
  const user = await User.create({
    firstname,
    lastname,
    dateofbirth,
    email,
    password,
    securityAnswer,
    securityQuestion,
    secureMail,
    isResettingPassword: false,
    pic,
  });

  console.log('User created:', user);

  // // Génération et sauvegarde de l'OTP
  // const generatedOTP = await user.generateOTP();
  // console.log(Generated OTP: ${generatedOTP});

  // const adminUser = await User.findOne({ email: 'contact@talkmail.dz' });
  // if (!adminUser) {
  //   return res.status(404).json({ error: 'admin introuvable.' });
  // }

  // const adminId = adminUser._id;

  // const welcomeMail = new MailModel({
  //   from: adminUser._id,
  //   to: user._id,
  //   subject: 'Bienvenue sur TalkMail',
  //   message: `
  //       Bonjour et bienvenue sur notre plateforme !

  //       Nous sommes ravis de vous avoir parmi nous. C'est un plaisir de vous accueillir dans notre communauté.

  //       Rejoignez-nous sur :
  //       - LinkedIn: [https://www.linkedin.com/company/isinnovate]
  //       - Twitter: [https://x.com/isinnovateteam]
  //       - Instagram: [https://www.instagram.com/isinnovate]

  //       Si vous avez des questions, n'hésitez pas à nous contacter à l'adresse suivante : [contact@talkmail.dz].

  //       Merci encore de faire partie de notre communauté. Nous sommes impatients de vous offrir une expérience exceptionnelle !

  //       Bien cordialement,
  //       L'équipe ISInnovate.
  //   `,
  // });

  await welcomeMail.save();
  const populatedMail = await MailModel.findById(welcomeMail._id).populate({
    path: 'to',
    select: 'firstname lastname email',
  });

  // await MailBoxModel.findOneAndUpdate(
  //   { userId: user._id, name: 'Inbox' },
  //   { $addToSet: { mails: populatedMail } },
  //   { upsert: true },
  // );
  // Envoi d'une réponse avec les détails de l'utilisateur et un token d'authentification
  // la c juste pour l'api dans postman sinon on peut renvoyer un message du type inscription reussie
  if (user) {
    res.status(201).json({
      _id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      dateofbirth: user.dateofbirth,
      email: user.email,
      securityAnswer: user.securityAnswer,
      isResettingPassword: user.isResettingPassword,
      securityQuestion: user.securityQuestion,
      secureMail: user.secureMail,
      otp: user.otp,
      token: generateToken(user._id),
      pic: user.pic,
      twoFA: user.twoFA,
    });
  } else {
    res.status(400);
    throw new Error('Failed to create the user');
  }
});

// Cette fonction est destinée à l'authentification d'un utilisateur existant.
// Elle recherche l'utilisateur dans la base de données par e-mail et vérifie le mot de passe.
// Envoie une réponse avec les détails de l'utilisateur et un token d'authentification en cas de succès, sinon envoie une réponse d'erreur avec un code 401.

const authUser = asyncHandler(async (req, res) => {
  // Extraction des données du corps de la requête
  const { email, password } = req.body;

  try {
    // Recherche de l'utilisateur dans la base de données
    const user = await User.findOne({ email }).select('+otp');

    // Vérification du mot de passe
    if (user) {
      const isPasswordValid = await user.comparePassword(password);

      if (isPasswordValid) {
        if (user.twoFA) {
          const generatedOTP = genOTP();
          OTP(user.secureMail, generatedOTP);
          res.json({
            user: {
              _id: user._id,
              firstname: user.firstname,
              lastname: user.lastname,
              dateofbirth: user.dateofbirth,
              email: user.email,
              securityAnswer: user.securityAnswer,
              isResettingPassword: user.isResettingPassword,
              token: generateToken(user._id),
              pic: user.pic,
              secureMail: user.secureMail,
              twoFA: user.twoFA,
            },
            generatedOTP,
          });
        } else {
          res.json({
            user: {
              _id: user._id,
              firstname: user.firstname,
              lastname: user.lastname,
              dateofbirth: user.dateofbirth,
              email: user.email,
              securityAnswer: user.securityAnswer,
              isResettingPassword: user.isResettingPassword,
              token: generateToken(user._id),
              pic: user.pic,
              secureMail: user.secureMail,
              twoFA: user.twoFA,
            },
          });
        }
      } else {
        // Mot de passe incorrect, envoi d'une réponse d'erreur
        res.status(401).json({ error: 'Invalid password' });
      }
    } else {
      // Email incorrect, envoi d'une réponse d'erreur
      res.status(401).json({ error: 'Invalid email' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const searchUsers = asyncHandler(async (req, res) => {
  // c tileli HSD ittikhedhmen wlh ma d nek saqsimtt nettath hahah nek machi aka niqal ittkhedhmegh
  try {
    const keyword = req.query.search
      ? {
          // 'or' pour chercher des docs dans lesquels au moins yiweth de ces conditions est vraie,
          $or: [
            { firstname: { $regex: req.query.search, $options: 'i' } },
            { lastname: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } },
          ],
        }
      : {};
    // Recherche des user en fct de la condition construite et exclut user actuellement connecté...
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } }); // $ne ma3nas sauf user qui est connecté celui qui a fait la requete c not n sql
    // res avec les user trouvés
    res.send(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while search user ' });
  }
});

const deleteUsers = asyncHandler(async (req, res) => {
  // ça c la version optimisé
  // je recupere direct l id apres supprimi et result nni ad yafficher les info n winna que j'ai supprimé
  // const result = await User.findByIdAndDelete(req.params.id);
  // res.json({ result });

  // je récupere l id daki
  const userId = req.params.id;

  // notez bien que ces console log grv grv tt3awanent pour localiser l erreur ma thella 😉

  try {
    const user = await User.findOne({ _id: userId }); // anwalli ma yella 😉
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' }); // khati ulachith x)
    }

    // await user.remove(); thaki n'est pas prédifinite anabrrri de l'utiliser sinon faut creer une fonction s yisem aki remove pour find one and delete ok !!
    await User.deleteOne({ _id: userId }); // delete aken thezram

    res.status(200).json({ message: 'Acccount deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'err serveur' });
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  // on saisi email et la reponse a la qst de sécurité
  const { email, securityAnswer } = req.body;

  const user = await User.findOne({ email }); // yella ?

  if (!user) {
    return res.status(404).json({ error: 'User not found' }); // nn ulachith ughaled azka ;))
  }

  // but does the answer match akked wayen dennidh deja ?
  if (user.securityAnswer !== securityAnswer) {
    return res.status(401).json({ error: 'Incorrect security answer' });
  }

  user.isResettingPassword = true; // daki thoura nezmer anvedel le mdp s reset akki qui suit

  try {
    await user.save();

    res.json({ message: 'Security answer verified successfully' });
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  // daki blama nenad
  const { email, newPassword } = req.body;

  const user = await User.findOne({ email }); //on verifi mayella user s lemail nni akked is resettttbfuvbe aki true

  if (!user) {
    return res.status(401).json({ error: 'Invalid req or user not found' });
  }

  user.password = newPassword; // daki anvedel mdp

  user.isResettingPassword = false; // apres athner ar false aken yella zik par defaul

  await user.save(); // save les changement

  // res.json({ message: 'Password reset successful' });
  res.json({ success: true, message: 'Password reset successful' });
});

const changePassword = asyncHandler(async (req, res) => {
  const currentuser = req.user;

  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(currentuser.id).select('+password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      return res.status(401).json({ error: 'Old password is incorrect' });
    }
    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const changePic = asyncHandler(async (req, res) => {
  const currentuser = req.user;
  try {
    const { newPic } = req.body;
    const updatedUser = await User.findOneAndUpdate(
      { _id: currentuser.id },
      { $set: { pic: newPic } },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      firstname: updatedUser.firstname,
      lastname: updatedUser.lastname,
      pic: updatedUser.pic,
    });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const sendOtp = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email }).select('secureMail');

    const moh = genOTP();
    const generatedOTP = OTP(user.secureMail, moh);

    res.status(200).json(moh);
  } catch (error) {
    console.error("Error lors de l'envoi de l'OTP", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const toggleTwoFA = asyncHandler(async (req, res) => {
  const currentUserId = req.user.id;

  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: currentUserId },
      { $set: { twoFA: req.user.twoFA ? false : true } },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      firstname: updatedUser.firstname,
      lastname: updatedUser.lastname,
      twoFA: updatedUser.twoFA,
      email: updatedUser.email,
    });
  } catch (error) {
    console.error("Error updating user's TwoFA status:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = {
  registerUser,
  authUser,
  searchUsers,
  deleteUsers,
  forgotPassword,
  resetPassword,
  changePassword,
  changePic,
  sendOtp,
  toggleTwoFA,
};
