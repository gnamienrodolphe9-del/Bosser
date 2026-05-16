// Middleware quota freemium — vide pour l'instant
// Sera utilisé quand on ajoutera le système premium

const quotaMiddleware = (req, res, next) => {
  // Pour l'instant pas de limite
  // Plus tard : vérifier si l'utilisateur a dépassé son quota gratuit
  next();
};

module.exports = quotaMiddleware;