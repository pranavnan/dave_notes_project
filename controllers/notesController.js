const User = require('../models/User');
const Note = require('../models/Note');
const asyncHandler = require('express-async-handler');

// @desc Get all notes
// @route GET /notes
// @access Private
const getAllNotes = asyncHandler(async (req, res) => {
  // Get all notes from mongoDB
  const notes = await Note.find().lean();
  if (!notes) {
    return res.status(400).json({ message: 'No notes found' });
  }

  // console.log({notes});

  const notesWithUser = await Promise.all(
    notes.map(async note => {
      const user = await User.findOne({ _id: note.user }).select('-password').lean().exec();
      // console.log({user});
      return { ...note, username: user?.username ?? '' };
    })
  );

  res.json(notesWithUser);
});

// @desc Get all notes
// @route GET /notes
// @access Private
const createNewNote = asyncHandler(async (req, res) => {
  const { user, title, text } = req.body;

  // confirm data
  if (!user || !title || !text) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Check for duplicate title
  const duplicate = await Note.findOne({ title }).lean().exec();

  if (duplicate) {
    return res.status(409).json({ message: 'Duplicate note title' });
  }

  // create and store the new note
  const note = await Note.create({ user, title, text });

  if (note) {
    return res.status(201).json({ message: 'New note created' });
  } else {
    return res.status(400).json({ message: 'Invalid note data received' });
  }
});

// @desc Update a notes
// @route PATCH /notes
// @access Private
const updateNote = asyncHandler(async (req, res) => {
  const { id, user, title, text, completed } = req.body;

  // confirm data
  if (
    !id ||
    !user ||
    !title ||
    !text ||
    !completed ||
    typeof completed !== 'boolean'
  ) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Confirm note exists to update
  const note = await Note.findById(id).exec();

  if (!note) {
    return res.status(400).json({ message: 'Note not found' });
  }

  // check for duplicate title
  const duplicate = await Note.findOne({ title }).lean().exec();

  // check if the comming title is already exists in other note expect the edited one
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: 'Duplicate note title' });
  }

  note.user = user;
  note.title = title;
  note.text = text;
  note.completed = completed;

  const updateNote = await note.save();

  res.json(`'${updateNote.title}' updated`);
});

// @desc Delete a notes
// @route DELETE /notes
// @access Private
const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: 'Note ID required' });
  }

  // Confirm note exists to delete
  const note = await Note.findById(id).exec();

  if (!note) {
    return res.status(400).json({ message: 'Note not found' });
  }

  const result = await note.deleteOne();

  const reply = `Note '${result.title}' with ID ${result._id} deleted`;

  res.json(reply);
});

module.exports = {
  getAllNotes,
  createNewNote,
  updateNote,
  deleteNote,
};
