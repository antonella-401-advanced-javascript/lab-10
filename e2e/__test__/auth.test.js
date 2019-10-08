const request = require('../request');
const { dropCollection } = require('../db');
const jwt = require('jsonwebtoken');
const { signupUser } = require('../data-helpers');
const User = require('../../lib/models/user');

describe('Auth API', () => {
  beforeEach(() => dropCollection('users'));

  const testUser = {
    email: 'me@me.com',
    password: 'abc'
  };

  let user = null;

  beforeEach(() => {
    return request
      .post('/api/auth/signup')
      .send(testUser)
      .expect(200)
      .then(({ body }) => (user = body));
  });

  it('signs up a user', () => {
    expect(user.token).toBeDefined();
  });

  it('cannot sign up with same email', () => {
    return request
      .post('/api/auth/signup')
      .send(testUser)
      .expect(400)
      .then(({ body }) => {
        expect(body.error).toBe('Email me@me.com already in use');
      });
  });

  function testEmailAndPasswordRequired(route, testProperty, user) {
    it(`${route} requires ${testProperty}`, () => {
      return request
        .post(`/api/auth/${route}`)
        .send(user)
        .expect(400)
        .then(({ body }) => {
          expect(body.error).toBe('Email and password required');
        });
    });
  }

  testEmailAndPasswordRequired('signup', 'email', {
    password: 'I no like emails'
  });
  testEmailAndPasswordRequired('signup', 'password', {
    email: 'no@password.com'
  });
  testEmailAndPasswordRequired('signin', 'email', {
    password: 'I no like emails'
  });
  testEmailAndPasswordRequired('signin', 'password', {
    email: 'no@password.com'
  });

  it('signs in a user', () => {
    return request
      .post('/api/auth/signin')
      .send(testUser)
      .expect(200)
      .then(({ body }) => {
        expect(body.token).toBeDefined();
      });
  });

  function testBadSignup(testName, user) {
    it(testName, () => {
      return request
        .post('/api/auth/signin')
        .send(user)
        .expect(401)
        .then(({ body }) => {
          expect(body.error).toBe('Invalid email or password');
        });
    });
  }

  testBadSignup('rejects bad password', {
    email: testUser.email,
    password: 'bad password'
  });

  testBadSignup('rejects invalid email', {
    email: 'bad@email.com',
    password: testUser.password
  });

  it('verifies a token', () => {
    return request
      .get('/api/auth/verify')
      .set('Authorization', user.token)
      .expect(200);
  });

  it('verifies a bad token', () => {
    return request
      .get('/api/auth/verify')
      .set('Authorization', jwt.sign({ foo: 'bar' }, 'shhhhh'))
      .expect(401);
  });
});

describe('Admin Api', () => {
  const testAdmin = {
    email: 'admin@admin.com',
    password: 'test admin'
  };

  const testUser = {
    email: 'user@user.com',
    password: 'test user'
  };

  function signinAdmin(admin = testAdmin) {
    return request
      .post('/api/auth/signin')
      .send(admin)
      .expect(200)
      .then(({ body }) => body);
  }

  it('admin can make changes to users', () => {
    return signupUser(testAdmin)
      .then(user => {
        return User.updateById(user._id, {
          $addToSet: {
            roles: 'admin'
          }
        });
      })
      .then(() => {
        return Promise.all([signinAdmin(), signupUser(testUser)]).then(
          ([adminUser, user]) => {
            return request
              .put(`/api/auth/users/${user._id}/roles/admin`)
              .set('Authorization', adminUser.token)
              .expect(200)
              .then(({ body }) => {
                expect(body.roles[0]).toBe('admin');
              });
          }
        );
      });
  });

  const testing = {
    email: 'testtest@hotmail.com',
    password: 'test'
  };

  it('allows admin to take away user admin status', () => {
    return Promise.all([signinAdmin(), signupUser(testing)]).then(
      ([adminUser, testing]) => {
        return request
          .put(`/api/auth/users/${testing._id}/roles/admin`)
          .set('Authorization', adminUser.token)
          .expect(200)
          .then(({ body }) => {
            return request
              .delete(`/api/auth/users/${body._id}/roles/admin`)
              .set('Authorization', adminUser.token)
              .expect(200)
              .then(({ body }) => {
                expect(body.roles[0]).toBeUndefined;
              });
          });
      }
    );
  });
});

describe('Auth Admin Gets All Users', () => {
  beforeEach(() => dropCollection('users'));

  const testAdmin = {
    email: 'adadmind@adadming.com',
    password: 'tetsing'
  };

  function signinAdmin(admin = testAdmin) {
    return request
      .post('/api/auth/signin')
      .send(admin)
      .expect(200)
      .then(({ body }) => body);
  }

  const testing1 = {
    email: 'test1@test.com',
    password: 'test'
  };
  const testing2 = {
    email: 'test2@test.com',
    password: 'test'
  };
  const testing3 = {
    email: 'test3@test.com',
    password: 'test'
  };

  it('gets the _id, email, and roles of all users', () => {
    return signupUser(testAdmin)
      .then(user => {
        return User.updateById(user._id, {
          $addToSet: {
            roles: 'admin'
          }
        });
      })
      .then(() => {
        return Promise.all([
          signinAdmin(),
          signupUser(testing1),
          signupUser(testing2),
          signupUser(testing3)
        ]).then(([adminUser]) => {
          return request
            .get('/api/auth/users')
            .set('Authorization', adminUser.token)
            .expect(200)
            .then(({ body }) => {
              expect(body.length).toBe(4);
              expect(body[0]).toMatchInlineSnapshot(
                {
                  _id: expect.any(String)
                },
                `
                Object {
                  "_id": Any<String>,
                  "email": "adadmind@adadming.com",
                  "roles": Array [
                    "admin",
                  ],
                }
              `
              );
            });
        });
      });
  });
});
