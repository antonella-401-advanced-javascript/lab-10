const request = require('../request');
const db = require('../db');
const { signupUser } = require('../data-helpers');

describe('dogs api', () => {
  beforeEach(() => db.dropCollection('users'));
  beforeEach(() => db.dropCollection('dogs'));


  let user = null;
  beforeEach(() => {
    return signupUser().then(newUser => (user = newUser));
  });

  const akk = {
    breed: 'Alaskan Klee Kai',
    size: ['small', 'medium'],
    weight: 16,
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

  it('post a dog', () => {
    return request
      .post('/api/dogs')
      .set('Authorization', user.token)
      .send(akk)
      .expect(200)
      .then(({ body }) => {
        expect(body.owner).toBe(user._id);
        expect(body).toMatchInlineSnapshot(
          {
            _id: expect.any(String),
            owner: expect.any(String)
          },
          `
          Object {
            "__v": 0,
            "_id": Any<String>,
            "breed": "Alaskan Klee Kai",
            "owner": Any<String>,
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

  it('gets a dog by id', () => {
    return postDog(akk).then(dog => {
      return request
        .get(`/api/dogs/${dog._id}`)
        .set('Authorization', user.token)
        .expect(200)
        .then(({ body }) => {
          expect(body).toMatchInlineSnapshot(
            {
              _id: expect.any(String),
              owner: expect.any(String)
            },
            `
            Object {
              "__v": 0,
              "_id": Any<String>,
              "breed": "Alaskan Klee Kai",
              "owner": Any<String>,
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

  it('gets a list of dogs', () => {
    return Promise.all([
      postDog({
        breed: 'Alaskan Klee Kai',
        nicknames: ['AKK', 'Klee Kai', 'Miniature Alaskan Husky', 'Mini Husky'],
        size: ['small', 'medium'],
        appearance: { pattern: 'bicolor', color: 'grey and white' },
        weight: 16,
        purebred: true
      }),
      postDog({
        breed: 'Alaskan Klee Kai2',
        nicknames: ['AKK', 'Klee Kai', 'Miniature Alaskan Husky', 'Mini Husky'],
        size: ['small', 'medium'],
        appearance: { pattern: 'bicolor', color: 'grey and white' },
        weight: 16,
        purebred: true
      }),
      postDog({
        breed: 'Alaskan Klee Kai3',
        nicknames: ['AKK', 'Klee Kai', 'Miniature Alaskan Husky', 'Mini Husky'],
        size: ['small', 'medium'],
        appearance: { pattern: 'bicolor', color: 'grey and white' },
        weight: 16,
        purebred: true
      })
    ])
      .then(() => {
        return request
          .get('/api/dogs')
          .set('Authorization', user.token)
          .expect(200);
      })
      .then(({ body }) => {
        expect(body.length).toBe(3);
        expect(body[0]).toMatchInlineSnapshot(
          {
            _id: expect.any(String),
            owner: expect.any(String)
          },
          `
          Object {
            "__v": 0,
            "_id": Any<String>,
            "breed": "Alaskan Klee Kai",
            "owner": Any<String>,
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

  it('updates a dog', () => {
    return postDog(akk)
      .then(dog => {
        dog.weight = 10;
        return request
          .put(`/api/dogs/${dog._id}`)
          .set('Authorization', user.token)
          .send(dog)
          .expect(200);
      })
      .then(({ body }) => {
        expect(body.weight).toBe(10);
      });
  });

  it('deletes a dog', () => {
    return postDog(akk)
      .then(dog => {
        return request
          .delete(`/api/dogs/${dog._id}`)
          .set('Authorization', user.token)
          .expect(200);
      })
      .then(() => {
        return request
          .get('/api/dogs')
          .set('Authorization', user.token)
          .expect(200)
          .then(({ body }) => {
            expect(body.length).toBe(0);
          });
      });
  });
});
