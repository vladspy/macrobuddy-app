const express = require('express');
const router = express.Router();
const { addUser } = require('../db/addUser');
const { verifyUser } = require('../db/verifyUser');


router.post('/addUser', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const result = await addUser (username, email, password);
    if (result.success) {
      res.status(201).json({ message: 'User added successfully!' });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ error: 'Failed to add user.' });
  }
});
  
router.post('/verifyUser', async (req, res) => {
  try {
      const { username, password } = req.body;
      const result = await verifyUser(username, password);

      if (result.success) {
          // Create session or token
          req.session.user = { id: result.userId, username };
          res.cookie('sessionID', req.sessionID, { httpOnly: true });
          res.status(201).json({ success: true, message: 'User verified successfully!' });
      } else {
          res.status(401).json({ error: 'Invalid username or password.' });
      }
  } catch (error) {
      console.error('Error verifying user:', error.message);
      res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

  
module.exports = router;
