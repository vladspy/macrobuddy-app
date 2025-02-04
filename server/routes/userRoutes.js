const express = require('express');
const router = express.Router();
const { addUser } = require('../db/addUser');
const { verifyUser } = require('../db/verifyUser');

router.post('/addUser', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const result = await addUser(username, email, password);

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

// ✅ Handle User Login with Sessions
router.post('/verifyUser', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await verifyUser(email, password);

        if (result.success) {
            // ✅ Store session & set cookie
            req.session.user = { email };
            res.cookie('sessionID', req.sessionID, { httpOnly: true });
            
            res.status(200).json({ success: true, message: 'User verified successfully!' });
        } else {
            res.status(401).json({ error: 'Invalid email or password.' });
        }
    } catch (error) {
        console.error('Error verifying user:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ✅ Logout Route
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: "Failed to log out." });
        }
        res.clearCookie("sessionID");
        res.json({ success: true, message: "Logged out successfully!" });
    });
});

router.post('/logout', (req, res) => {
  res.clearCookie("sessionID", { httpOnly: true, sameSite: "Lax" }); // 🔥 Clears session cookie
  req.session.destroy(err => {
      if (err) {
          return res.status(500).json({ error: "Logout failed." });
      }
      res.json({ success: true, message: "Logged out successfully." });
  });
});
module.exports = router;
