const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/

const UsersService = {
  checkPassword(password) {
    if(password.startsWith(' ') || password.endsWith(' ')) {
      return "Password must not start or end with empty spaces"
    }
    if (password.length < 9 || password.length > 71) {
      return 'Password must be more than 8 and less than 72 characters'
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return 'Password must contain 1 upper case, lower case, number and special character'
    }
    return null
  },
  hasUserWithUserName(db, user_name) {
    return db('thingful_users')
      .where({ user_name })
      .first()
      .then(user => !!user)
  }
}

module.exports = UsersService;