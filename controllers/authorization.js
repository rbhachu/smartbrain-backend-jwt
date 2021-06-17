
// for signin
const redisClient = require('./signin').redisClient;

// for profile, image, imageurl
const requireAuth = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).send('Unauthorized1');
  }
  return redisClient.get(authorization, (err, reply) => {
    if (err || !reply) {
      return res.status(401).send('Unauthorized2');
    }
    return next();
  });
};

module.exports = {
  requireAuth
}