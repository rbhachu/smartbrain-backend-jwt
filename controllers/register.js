//const { restart } = require("nodemon");

const handleRegister = (req, res, db, bcrypt) => { // dependency injection, passing 'db' and 'bcrypt' to register.js from server.js
    const { name, email, password } = req.body; //get email, name, password from POST body

    // form validation
    if (!name || !email|| !password) { // check if email OR name OR password are empty, if = true, responsd with error
        return res.status(400).json('incorrect form submission'); // return added to block further code execution if form fields empty is true
    }
 
    const saltRounds = 10
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);

    db.transaction(trx => { // create transaction wrapper
        trx.insert({ // insert statement
            hash: hash, // hash password
            email: email // matching email from user table
        })
    .into('login') // into login table
    .returning('email')
    .then(loginEmail => {
        return trx('users') // connect to db using transaction
        .returning('*') // built-in response in knex to return all data
        .insert({ // insert statement
            email: loginEmail[0],
            name: name,
            joined: new Date()
            })
        //.then(console.log) //check data coming back
        .then(user => {
            res.json(user[0]); //get details of last user added 
        })
    })
    .then(trx.commit) // if succesfull commit above
    .catch(trx.rollback) // if issues revert back
    })
    .catch(err => res.status(400).json('unable to register')) // if error respons with error 400

}

module.exports = {
    handleRegister: handleRegister
};