const express = require('express');
const path = require('path');
const UsersService = require('./users-service');

const usersRouter = express.Router();
const jsonBodyParser = express.json();


usersRouter
  .post('/', jsonBodyParser, (req, res, next) => {

    const { password, user_name, full_name, nickname } = req.body;
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
          return res.status(400).json({ error: 'That Username is already taken'})
        } 

        return UsersService.hashPassword(password)
          .then(hashedPassword => {
            const newUser = {
              user_name,
              password: hashedPassword,
              full_name,
              nickname,
              date_created: 'now()'
            }
            return UsersService.insertUser(req.app.get('db'), newUser)
              .then(user => {
                res
                  .status(201)
                  .location(path.posix.join(req.originalUrl, `/${user.id}`))
                  .json(UsersService.serializeUser(user))
              })
          })
      })
      .catch(next);

  })

  module.exports = usersRouter;