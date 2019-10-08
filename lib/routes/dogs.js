/* eslint-disable new-cap */
const router = require('express').Router();
const Dog = require('../models/dog');

router
  .post('/', (req, res, next) => {
    req.body.owner = req.user.id;

    Dog.create(req.body)
      .then(dog => {
        return res.json(dog);
      })
      .catch(next);
  })

  .get('/:id', (req, res, next) => {
    Dog.findById(req.params.id)
      .lean()
      .then(dog => {
        return res.json(dog);
      })
      .catch(next);
  })

  .get('/', ({ query }, res, next) => {
    const findQuery = {};
    if(query.breed) findQuery.breed = query.breed;
    if(query.size) findQuery.size = query.size;

    Dog.find(findQuery)
      .populate()
      .lean()
      .then(dogs => {
        return res.json(dogs);
      })
      .catch(next);
  })

  .put('/:id', ({ params, body, user }, res, next) => {
    Dog.updateOne({
      _id: params.id,
      owner: user.id
    }, body)
      .then(dog => {
        return res.json(dog);
      })
      .catch(next);
  })

  .delete('/:id', ({ params, user }, res, next) => {
    Dog.findByIdAndRemove({
      _id: params.id,
      owner: user.id
    })
      .then(removed => {
        res.json(removed);
      })
      .catch(next);
  });
    
    


module.exports = router;