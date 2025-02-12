const express = require("express");
const router = express.Router();

const { addUser } = require("../db/addUser");
const { verifyUser } = require("../db/verifyUser");

// ✅ Register User
router.post('/addUser', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await addUser(username, email, password);

    if (result.success) {
      res.status(201).json({ 
        message: 'User added successfully!', 
        userId: result.userId // ✅ Now includes userId in response
      });
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
    console.log("🔍 Login attempt:", req.body);
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const result = await verifyUser(email, password);

    if (result.success) {
      console.log("✅ User verified:", email, "UserId:", result.userId);
      req.session.user = { email, userId: result.userId };
      res.cookie('sessionID', req.sessionID, { httpOnly: true, secure: false, sameSite: "Strict" });
      // ✅ Return both the token and the userId so the client can store them
      return res.status(200).json({ 
        success: true, 
        message: 'User verified successfully!', 
        token: result.token,
        userId: result.userId 
      });
    } else {
      console.log("❌ Invalid credentials for:", email);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
  } catch (error) {
    console.error("❌ Error verifying user:", error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ Check if User is Logged In
router.get('/isLoggedIn', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ loggedIn: true, userId: req.session.user.userId });
  } else {
    res.json({ loggedIn: false });
  }
});

// ✅ Logout Route (Clears client-side token)
router.post("/logout", (req, res) => {
  res.clearCookie("authToken", { path: "/", httpOnly: true, secure: true, sameSite: "Strict" });
  req.session.destroy(() => {
    res.json({ success: true, message: "Logged out successfully!" });
  });
});

module.exports = router;
