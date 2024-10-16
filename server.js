const express = require('express'); // invoke express js server
const bcrypt = require('bcryptjs'); // invoke bcrypt for password encrypt
const cors = require('cors'); // invoke cors for site cross scripting
const knex = require('knex'); // invoke knex for connection to PostgreSQL DB
const dotenv = require('dotenv').config(); // .env vars
const morgan = require('morgan'); // logger
const signin = require('./controllers/signin'); // signin function page
const register = require('./controllers/register'); // register function page
const profile = require('./controllers/profile'); // profile function page
const image = require('./controllers/image'); // image function page
const auth = require('./controllers/authorization'); // auth page


// LOCAL db connection
/*
const db = knex({ // for connecting to PostgreSQL
    client: 'pg', // type of db
    connection: { 
      host : '127.0.0.1', // localhost 
      user : 'postgres', // superuser
      password : 'test', // superuser pass
      database : 'smartbrain' // db to connect to
    }
  });
*/

// HEROKU db connection
const db = knex({ // for connecting to PostgreSQL
  client: 'pg', // type of db
  connection: { 
    connectionString: process.env.DATABASE_URL, // dynamic database value from heroku hosting server    
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});
//console.log(db.select('*').from('users')); //test connection to db is working

const app = express(); // express js server
app.use(cors()); // use 'app.use' as is middleware
app.use(express.json()); // Used to parse JSON bodies
//app.use(express.urlencoded()); // states bodyparser is depricated when used, so disabled
app.use(morgan('combined'));

app.get('/', (req, res) => { res.send(`SmartBrain-Backend-Master Running on port ${process.env.PORT}`) })
app.post('/signin', signin.signinAuthentication(db, bcrypt))
app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) })
app.get('/profile/:id', auth.requireAuth, (req, res) => { profile.handleProfileGet(req, res, db)})
app.post('/profile/:id', auth.requireAuth, (req, res) => { profile.handleProfileUpdate(req, res, db)})
app.put('/image', auth.requireAuth, (req, res) => { image.handleImage(req, res, db)})
app.post('/imageurl', auth.requireAuth, (req, res) => { image.handleApiCall(req, res)})

//express server
app.listen(process.env.PORT || 3001, () => { // use dynamic port value or 3001
  console.log(`app is running on port ${process.env.PORT}`); // server message on success
})