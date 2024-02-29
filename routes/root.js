const express = require('express');
const path = require('path');

const router = express.Router();

// ^ => means at the beginning of the string only
// $ => means at the end of the string only
// | => that means user can access the middleware by sending the "/" or "/index" or "/index.html"
router.get('^/$|/index(.html)?', async (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
});

module.exports = router;
