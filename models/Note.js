const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId, // foreign key of User schema
      require: true,
      ref: 'User', // refer to the User schema
    },
    title: {
      type: String,
      require: true,
    },
    text: {
      type: String,
      require: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // mongodb gives us "createdAt" and "updatedAt" fields just by make this timestamps as true
  }
);

noteSchema.plugin(AutoIncrement, {
  inc_field: 'ticket', // this will create a ticket field inside of out note schema
  id: 'ticketNums', // we didnt see this inside of out Notes collection what will happen is a seperate collection named counter will be created and we can see this id inside of that counter collection
  start_seq: 500, // the starting sequence will usually starts from the 0 but we need to start from 500
});

const User = mongoose.model('Note', noteSchema);

module.exports = User;
