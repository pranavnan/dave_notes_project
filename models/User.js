const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  roles: [
    {
      type: String,
      default: 'Employee',
    },
  ], // this array defines that more than one user roles can be there
  active: {
    type: Boolean,
    default: true,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
