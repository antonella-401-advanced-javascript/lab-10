// eslint-disable-next-line new-cap
const router = require('express').Router();
const Cat = require('../models/cat');
const ensureRole = require('../middleware/ensure-role');

router
  .get('/', (req, res, next) => {
    Cat.find()
      .select('breed nickname')
      .lean()
      .then(cats => {
        return res.json(cats);
      })
      .catch(next);
  })

  .post('/', ensureRole('admin'), (req, res, next) => {
    Cat.create(req.body)
      .then(cat => {
        return res.json(cat);
      })
      .catch(next);
  })

  .put('/:id', ensureRole('admin'), ({ params, body }, res, next) => {
    Cat.updateOne({
      _id: params.id,
    }, body)
      .select('breed nickname')
      .then(cat => {
        return res.json(cat);
      })
      .catch(next);
  })

  .delete('/:id', ensureRole('admin'), ({ params }, res, next) =>{
    Cat.findByIdAndRemove(params.id)
      .then(removed => {
        return res.json(removed);
      })
      .catch(next);
  });

module.exports = router;