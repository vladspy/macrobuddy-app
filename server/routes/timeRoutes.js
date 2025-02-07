// timeRoutes.js
const express = require('express');
const router = express.Router();

// This route returns the current server time in ISO format
router.get('/', (req, res) => {
  res.json({ time: new Date().toISOString() });
});

module.exports = router;
