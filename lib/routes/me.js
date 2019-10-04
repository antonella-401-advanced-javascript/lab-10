// eslint-disable-next-line new-cap
const router = require('express').Router();
const User = require('../models/user');

router
  .get('/favorites', ({ user }, res, next) => {
    User.findById(user.id)
      .populate('favorites', 'breed size weight purebred')
      .lean()
      .then(({ favorites }) => res.json(favorites))
      .catch(next);
  })

  .put('/favorites/:dogId', ({ user, params }, res, next) => {
    User.updateById(user.id, {
      $addToSet: {
        favorites: params.dogId
      }
    })
      .populate('favorites', 'breed size weight purebred')
      .then(({ favorites }) => res.json(favorites))
      .catch(next);
  })

  .delete('/favorites/:dogId', ({ user, params }, res, next) => {
    User.findByIdAndDelete(user.id, {
      $pull: {
        favorites: params.dogId
      }
    })
      .then(removed => {
        res.json(removed);
      })
      .catch(next);
  });

module.exports = router;