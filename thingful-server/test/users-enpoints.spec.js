const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only('Users Endpoints', function() {
  let db

  const { testUsers } = helpers.makeThingsFixtures();
  const testUser = testUsers[0];

  function validUserSubmission() {
    return {
      user_name: 'test user_name',
      password: 'ABCabc123@',
      full_name: 'test full_name',
      nickname: 'test nickname'
    }
  }

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe('POST /api/users', () => {
    context('User Validation', () => {
      beforeEach('insert users', () => 
        helpers.seedUsers(
          db,
          testUsers
        )
      )

      const requiredFields = ['user_name', 'password', 'full_name']

      requiredFields.forEach(field => {
        const registerAttemptBody = validUserSubmission();

        it(`responds with 400 required error when ${field} is missing`, () => {
          delete registerAttemptBody[field]

          return supertest(app)
            .post('/api/users')
            .send(registerAttemptBody)
            .expect(400, {
              error: `Missing ${field} in request body`
            })
        })
      })
      it('responds 400 password must be between 8 and 72 characters when short password', () => {
        const userShortPassword = validUserSubmission();
        userShortPassword.password = '1234567'
        return supertest(app)
          .post('/api/users')
          .send(userShortPassword)
          .expect(400, { error: 'Password must be more than 8 and less than 72 characters' })
      })
      it('responds 400 password must be between 8 and 72 characters when long password', () => {
        const userLongPassword = validUserSubmission();
        userLongPassword.password = 'a'.repeat(72)
        return supertest(app)
          .post('/api/users')
          .send(userLongPassword)
          .expect(400, { error: 'Password must be more than 8 and less than 72 characters' })
      })
      it('responds with 400 error when password starts with spaces', () => {
        const userPasswordStartsSpaces = validUserSubmission();
        userPasswordStartsSpaces.password = ' ABCabc@123'
        return supertest(app)
          .post('/api/users')
          .send(userPasswordStartsSpaces)
          .expect(400, { error: 'Password must not start or end with empty spaces'})
      })
      it('responds with 400 error when password ends with spaces', () => {
        const userPasswordEndsSpaces = validUserSubmission();
        userPasswordEndsSpaces.password = 'ABCabc@123 '
        return supertest(app)
          .post('/api/users')
          .send(userPasswordEndsSpaces)
          .expect(400, { error: 'Password must not start or end with empty spaces'})
      })
      it('responds with 400 when password is not complex enough', () => {
        const userSimplePassword = validUserSubmission();
        userSimplePassword.password = 'abcabcabc'
        return supertest(app)
          .post('/api/users')
          .send(userSimplePassword)
          .expect(400, { error: 'Password must contain 1 upper case, lower case, number and special character'})
      })
      it('responds 400 when user name is already taken', () => {
        const duplicateUser = validUserSubmission();
        duplicateUser.user_name = testUser.user_name;
        return supertest(app)
          .post('/api/users')
          .send(duplicateUser)
          .expect(400, {error: 'That Username is already taken'})
      })
    })
  })
})