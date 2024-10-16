// log into postgresql db
const handleSignin = (db, bcrypt, req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return Promise.reject('incorrect form submission');
  }
  return db.select('email', 'hash').from('login')
    .where('email', '=', email)
    .then(data => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        return db.select('*').from('users')
          .where('email', '=', email)
          .then(user => user[0])
          .catch(err => res.status(400).json('unable to get user'))
      } else {
        return Promise.reject('wrong credentials');
      }
    })
    .catch(err => err)
}


// TOKENS/SESSIONS
const jwt = require('jsonwebtoken'); // jwt
const redis = require('redis'); // redis
const redisClient = redis.createClient(process.env.REDISCLOUD_URL); // connect to redis db server

const setToken = (key, value) => Promise.resolve(redisClient.set(key, value));
//console.log(setToken);


const createSession = (user) => {
  const { email, id } = user;

  const token = jwt.sign({username: email}, process.env.JWT_SECRET, { expiresIn: '2 days'});

  return setToken(token, id)
    .then(() => {
      return { success: 'true', userId: id, token, user }
    })
    .catch(console.log);
};

// token
const signinAuthentication = (db, bcrypt) => (req, res) => {
  const { authorization } = req.headers;
  return authorization ? getAuthTokenId(req, res)
    : handleSignin(db, bcrypt, req, res)
    .then(data =>
      data.id && data.email ? createSession(data) : Promise.reject(data))
    .then(session => res.json(session))
    .catch(err => res.status(400).json(err));
}

// redis
const getAuthTokenId = (req, res) => {
  const { authorization } = req.headers;
  return redisClient.get(authorization, (err, reply) => {
    if (err || !reply) {
      return res.status(401).send('Unauthorized3');
    }
    return res.json({id: reply})
  });
}


module.exports = {
  signinAuthentication: signinAuthentication,
  redisClient: redisClient
}