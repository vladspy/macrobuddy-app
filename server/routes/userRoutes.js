const express = require('express');
const { addUser } = require('../db/addUser');
const { verifyUser } = require('../db/verifyUser');

const router = express.Router();

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

router.post('/verifyUser', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await verifyUser(email, password);

        if (result.success) {
            res.status(200).json({ success: true, token: result.token, message: 'Login successful!' });
        } else {
            res.status(401).json({ error: 'Invalid email or password.' });
        }
    } catch (error) {
        console.error('Error verifying user:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
