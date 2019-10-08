const mongoose = require('mongoose');
const { Schema } = mongoose;
const { RequiredString } = require('./required-types');

const schema = new Schema ({
  breed: RequiredString,
  nickname: RequiredString
});

module.exports = mongoose.model('Cat', schema);