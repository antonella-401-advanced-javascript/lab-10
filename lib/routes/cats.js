// eslint-disable-next-line new-cap
const router = require('express').Router();
const Cat = require('../models/cat');
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
      .select('breed nickname')
      .lean()
      .then(cats => {
        return res.json(cats);
      })
      .catch(next);
  })

  .get('/:id', (req, res, next) => {
    Cat.findById(req.params.id)
      .select('breed nickname owner')
      .then(cat => {
        return res.json(cat);
      })
      .catch(next);
  })

  .put('/:id', ensureRole(), ({ params, body }, res, next) => {
    Cat.updateOne({
      _id: params.id,
    }, body)
      .select('breed nickname')
      .then(cat => {
        return res.json(cat);
      })
      .catch(next);
  })

  .delete('/:id', ensureRole(), ({ params }, res, next) =>{
    Cat.findByIdAndRemove(params.id)
      .then(removed => {
        return res.json(removed);
      })
      .catch(next);
  });

module.exports = router;