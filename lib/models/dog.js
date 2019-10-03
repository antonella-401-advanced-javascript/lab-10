const mongoose = require('mongoose');

const { Schema } = mongoose;

const schema = new Schema({
  breed: {
    type: String,
    required:true
  },
  nicknames: [{
    type: String,
    required: false
  }],
  size: [{
    type: String,
    enum: ['large', 'medium', 'small', 'toy']
  }],
  appearance: {
    pattern: String,
    color: {
      type: String,
      required: true
    }
  },
  weight: {
    type: Number,
    required: true,
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