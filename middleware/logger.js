// Logger — enregistre chaque action utilisateur
// Utile pour les analytics long terme

const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  console.log(`[${timestamp}] ${method} ${url} — IP: ${ip}`);
  next();
};

module.exports = logger;