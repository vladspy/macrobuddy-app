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
        console.log("🔍 Login attempt:", req.body);
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Missing email or password" });
        }

        const result = await verifyUser(email, password);

        if (result.success) {
            console.log("✅ User verified:", email);
            req.session.user = { email };
            res.cookie('sessionID', req.sessionID, { httpOnly: true, secure: false, sameSite: "Strict" });
            return res.status(200).json({ success: true, message: 'User verified successfully!', token: result.token });
        } else {
            console.log("❌ Invalid credentials for:", email);
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
    } catch (error) {
        console.error("❌ Error verifying user:", error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ✅ Logout Route (Clears client-side token)
router.post("/logout", (req, res) => {
    res.clearCookie("authToken", { path: "/", httpOnly: true, secure: true, sameSite: "Strict" });
    res.json({ success: true, message: "Logged out successfully!" });
});

module.exports = router;
