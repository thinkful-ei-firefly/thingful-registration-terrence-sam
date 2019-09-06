const express = require('express');

const usersRouter = express.Router();
const jsonBodyParser = express.json();

const UsersService = require('./users-service')

usersRouter
  .post('/', jsonBodyParser, (req, res, next) => {

    const { password, user_name } = req.body;
    const requiredFields = ['full_name', 'user_name', 'password']

    for(const field of requiredFields) {
      if (!req.body[field])
        return res.status(400).json({ error: `Missing ${field} in request body` })
    }

    const passwordError = UsersService.checkPassword(password)
    if(passwordError) {
      return res.status(400).json({ error: passwordError})
    }

    UsersService.hasUserWithUserName(req.app.get('db'), user_name)
      .then(userExists => {
        if (userExists) {
          return res.status(400).json({ error: 'This Username is already taken'})
        } res.send('ok')
      })
      .catch(next);

  })

  module.exports = usersRouter;