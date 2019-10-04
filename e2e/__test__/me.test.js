const request = require('../request');
const db = require('../db');
const { signupUser } = require('../data-helpers');

describe('me API', () => {
  beforeEach(() => db.dropCollection('users'));
  beforeEach(() => db.dropCollection('dogs'));

  let user = null;
  beforeEach(() => {
    return signupUser().then(newUser => (user = newUser));
  });

  const dog1 = {
    breed: 'Alaskan Klee Kai',
    size: ['small', 'medium'],
    weight: 16,
    purebred: true,
    owner: {}
  };

  const dog2 = {
    breed: 'Corgi',
    size: ['small'],
    weight: 26,
    purebred: true,
    owner: {}
  };

  function postDog(dog) {
    return request
      .post('/api/dogs')
      .set('Authorization', user.token)
      .send(dog)
      .expect(200)
      .then(({ body }) => body);
  }

  function postFavorite(dog) {
    return postDog(dog).then(dog => {
      return request
        .put(`/api/me/favorites/${dog._id}`)
        .set('Authorization', user.token)
        .expect(200)
        .then(({ body }) => body);
    });
  }

  it('Populate favorites on user model', () => {
    return postFavorite(dog1).then(() => {
      return request
        .get('/api/me/favorites')
        .set('Authorization', user.token)
        .expect(200)
        .then(({ body }) => {
          expect(body[0]).toMatchInlineSnapshot(
            {
              _id: expect.any(String)
            },
            `
            Object {
              "_id": Any<String>,
              "breed": "Alaskan Klee Kai",
              "purebred": true,
              "size": Array [
                "small",
                "medium",
              ],
              "weight": 16,
            }
          `
          );
        });
    });
  });
});
