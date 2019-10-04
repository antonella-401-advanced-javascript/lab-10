// eslint-disable-next-line new-cap
const router = require('express').Router();
const User = require('../models/user');
const tokenService = require('../token-service');
const ensureAuth = require('../middleware/ensure-auth');
const ensureRole = require('../middleware/ensure-role');

const sendUser = (res, user) => {
  return tokenService.sign(user)
    .then(token => {
      res.json({
        _id: user._id,
        email: user.email,
        token: token
      });
    });
};

const checkCredentialsExist = (email, password) => {
  if(!email || !password) {
    return Promise.reject({
      statusCode: 400,
      error: 'Email and password required'
    });
  }
  return Promise.resolve();
};

router
  .get('/verify', ensureAuth(), (req, res) => {
    res.json({ verified: true });
  })

  .post('/signup', (req, res, next) => {
    const { body } = req;
    const { email, password } = body;

    checkCredentialsExist(email, password)
      .then(() => {
        // check if a user already has this email
        return User.exists({ email });
      })
      .then(exists => {

        if(exists) {
          throw {
            statusCode: 400,
            error: `Email ${body.email} already in use`
          };
        }
        return User.create(req.body);
      })
      .then(user => sendUser(res, user))
      .catch(next);
  })

  .post('/signin', (req, res, next) => {
    const { body } = req;
    const { email, password } = body;

    checkCredentialsExist(email, password)
      .then(() => {
        return User.findOne({ email });
      })
      .then(user => {
        if(!user || !user.comparePassword(password)) {
          throw {
            statusCode: 401,
            error: 'Invalid email or password'
          };
        }

        return sendUser(res, user);
      })
      .catch(next);
  })

  .put('/auth/users/:id/roles/:role', ensureRole(), (req, res, next) => {
    User.updateById(req.params.id, {
      $addToSet: {
        roles: req.params.role
      }
    })
      .then(({ roles }) => res.json(roles))
      .catch(next);
  })

  .delete('/auth/users/:id/roles/:role', ensureRole(), (req, res, next) => {
    User.updateById(req.params.id, {
      $pull: {
        roles: req.params.role
      }
    })
      .then(removed => {
        res.json(removed);
      })
      .catch(next);
  })

  .get('auth/users', ensureRole(), (req, res, next) => {
    User.find()
      .populate('users', '_id email roles')
      .lean()
      .then(({ users }) => {
        return res.json(users);
      })
      .catch(next);
  });

module.exports = router;