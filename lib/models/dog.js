const mongoose = require('mongoose');
const { Schema } = mongoose;
const { RequiredString } = require('./required-types');

const schema = new Schema({
  breed: RequiredString,
  size: [{
    type: String,
    enum: ['large', 'medium', 'small', 'toy']
  }],
  weight: {
    type: Number,
    min: 1,
    max: 120
  },
  purebred: {
    type: Boolean,
    default: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Dog', schema);