const request = require('../request');
const db = require('../db');
const { signupUser } = require('../data-helpers');
const User = require('../../lib/models/user');

describe('cats api', () => {
  beforeEach(() => db.dropCollection('cats'));
  beforeEach(() => db.dropCollection('users'));

  const testAdmin = {
    email: 'admin@admin.com',
    password: 'admin'
  };

  const testUser = {
    email: 'test@test.com',
    password: 'abc'
  };
  
  const kitty = {
    breed: 'Persian',
    nickname: 'Smushy face'
  };
  
  const kitty2 = {
    breed: 'Angora',
    nickname: 'Pretty'
  };

  function signinAdmin(admin = testAdmin) {
    return request
      .post('/api/auth/signin')
      .send(admin)
      .expect(200)
      .then(({ body }) => body);
  }

  it('posts a cat', () => {
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
          signinAdmin()
        ])
          .then(([admin]) => {
            return request
              .post('/api/cats')
              .set('Authorization', admin.token)
              .send(kitty)
              .expect(200)
              .then(({ body }) => {
                expect(body).toEqual({
                  _id: expect.any(String),
                  __v: 0,
                  ...kitty
                });
              });
          })
      })
  });

  it('gets cats', () => {
    return signupUser(testUser)
      .then(() => {
        return signupUser(testAdmin)
          .then(user => {
            return User.updateById(user._id, {
              $addToSet: {
                roles: 'admin'
              }
            });
          })
          .then(() => {
            return signinAdmin()
              .then(admin => {
                return request
                  .post('/api/cats')
                  .set('Authorization', admin.token)
                  .send(kitty)
                  .expect(200)
                  .then(() => {
                    return request
                      .post('/api/cats')
                      .set('Authorization', admin.token)
                      .send(kitty)
                      .expect(200)
                      .then(() => {
                        return signinAdmin(testUser)
                          .then(user => {
                            return request
                              .get('/api/cats')
                              .set('Authorization', user.token)
                              .expect(200)
                              .then(({ body }) => {
                                expect(body.length).toBe(2);
                              });
                          });
                      });
                  });
              });
          });
      });
  });
  
  it('updates a cat', () => {
    return signupUser(testUser)
      .then(() => {
        return signupUser(testAdmin)
          .then(user => {
            return User.updateById(user._id, {
              $addToSet: {
                roles: 'admin'
              }
            });
          })
          .then(() => {
            return signinAdmin()
              .then(admin => {
                return request
                  .post('/api/cats')
                  .set('Authorization', admin.token)
                  .send(kitty2)
                  .expect(200)
                  .then(({ body }) => body)
                  .then(cat => {
                    return request
                      .put(`/api/cats/${cat._id}`)
                      .set('Authorization', admin.token)
                      .send({ nickname: 'adorabs' })
                      .expect(200)
                      .then(({ body }) => {
                        expect(body.nickname).toBe('adorabs');
                      });
                  });
              });
          });
      });
  });
  
  it('deletes a cat', () => {
    return signupUser(testUser)
      .then(() => {
        return signupUser(testAdmin)
          .then(user => {
            return User.updateById(user._id, {
              $addToSet: {
                roles: 'admin'
              }
            });
          })
          .then(() => {
            return signinAdmin()
              .then(admin => {
                return request
                  .post('/api/cats')
                  .set('Authorization', admin.token)
                  .send(kitty)
                  .expect(200)
                  .then(({ body }) => {
                    return request
                      .delete(`/api/cats/${body._id}`)
                      .set('Authorization', admin.token)
                      .expect(200)
                      .then(() => {
                        return request
                          .get('/api/cats')
                          .set('Authorization', admin.token)
                          .expect(200)
                          .then(({ body }) => {
                            expect(body).toEqual([]);
                          });
                      });
                  });
              });
          });
      });
  });
  
});