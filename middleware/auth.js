// Middleware authentification — vide pour l'instant
// Sera utilisé quand on ajoutera les comptes utilisateurs

const authMiddleware = (req, res, next) => {
  // Pour l'instant tout le monde passe
  // Plus tard : vérifier le JWT token ici
  next();
};

module.exports = authMiddleware;