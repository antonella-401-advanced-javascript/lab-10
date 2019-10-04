// eslint-disable-next-line new-cap
const router = require('express').Router();
const Cat = require('../models/dog');
const ensureRole = require('../middleware/ensure-role');

router
  .post('/', ensureRole(), (req, res, next) => {
    Cat.create(req.body)
      .then(cat => {
        return res.json(cat);
      })
      .catch(next);
  })

  .get('/', (req, res, next) => {
    Cat.find()
      .then(cats => {
        return res.json(cats)
      })
      .catch(next);
  })

  .get('/:id', (req, res, next) => {
    Cat.findById(req.params.id)
      .then(cat => {
        return res.json(cat);
      })
      .catch(next);
  })

  .put('/:id', ensureRole(), (req, res, next) => {
    Cat.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .then(cat => {
        return res.json(cat);
      })
      .catch(next);
  })

  .delete('/:id', ensureRole(), (req, res, next) => {
    Cat.findByIdAndRemove(req.params.id)
      .then(removed => {
        return res.json(removed);
      })
      .catch(next);
  });

module.exports = router;