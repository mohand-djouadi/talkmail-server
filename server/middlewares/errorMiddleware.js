// Middleware pour gérer les routes non trouvées (404 Not Found)
const notFound = (req, res, next) => {
  // crée une nouvelle instance d'erreur avec un message indiquant que la ressource demandée n'a pas été trouvée.
  const error = new Error(`Not Found - ${req.originalUrl}`);
  // définit le statut de la réponse à 404 (Not Found) et passe l'erreur à la prochaine fonction middleware
  res.status(404);
  next(error);
};

// Middleware pour gérer les erreurs
const errorHandler = (err, req, res, next) => {
  // examine le statut de la réponse (res.statusCode). S'il est à 200 (OK), il le modifie à 500 (Internal Server Error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  // envoie une réponse JSON contenant le message d'erreur
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
