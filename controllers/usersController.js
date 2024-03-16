const User = require('../models/User');
const Note = require('../models/Note');

// escape hatch from try catch
const asyncHandler = require('express-async-handler');

// for hashing the password
const bcrypt = require('bcrypt');

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
  // .lean() method tell us to give normal result else we getting the mongoose object which have some handy methods.

  const user = await User.find().select('-password').lean();

  if (!user?.length) {
    return res.status(400).json({ message: 'No users found' });
  }
  res.json(user);
});

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;

  // Confirm Data
  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // check for duplicate
  const duplicate = await User.findOne({ username }).lean().exec();
  // .exec() => this method give us promise back, basically chain the .exec() if we supply some argument inside the any method

  if (duplicate) {
    return res.status(409).json({ message: 'Duplicate username' });
  }

  // Hash password
  const hashedPwd = await bcrypt.hash(password, 10);

  const userObject = {
    username,
    password: hashedPwd,
    roles,
  };

  // Create and store new user

  const user = await User.create(userObject);

  if (user) {
    // user created
    res.status(201).json({ message: `New user ${username} created` });
  } else {
    res.status(400).json({ message: 'Invalid user data received' });
  }
});

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
  const { id, username, roles, active, password } = req.body;

  // confirm data
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    typeof active !== 'boolean' ||
    (roles && !roles.length)
  ) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  // Check for duplicate
  const duplicate = await User.findOne({ username }).lean().exec();

  // Allow updates to the original users
  if (duplicate && duplicate?._id.toString() !== id) {
    // this case means that, we are able to find the user who has the same username that the current user wants to set
    return res.status(409).json({ message: 'Duplicate username' });
  }

  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    // hash the password
    user.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.username} updated` });
});

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'User ID Required' });
  }

  const notes = await Note.findOne({ user: id }).lean().exec();

  if (notes) {
    return res.status(400).json({ message: 'User has assigned notes' });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: 'User Not found' });
  }

  const result = await user.deleteOne();

  console.log({ result, user });

  const reply = `Username ${user.username} with ID ${user._id} deleted`;

  res.json(reply);
});

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
