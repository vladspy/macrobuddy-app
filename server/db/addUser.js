const { connectDB } = require('./db'); // Relative path to db.js
const argon2 = require('argon2'); // Import Argon2 for password hashing

// Function to add a user to the database
const addUser = async (username, email, plainTextPassword) => {
  try {
    // Validate inputs
    if (!username || typeof username !== 'string') {
      throw new Error('Username must be a non-empty string.');
    }
    if (!email || typeof email !== 'string') {
      throw new Error('Email must be a non-empty string.');
    }
    if (!plainTextPassword || typeof plainTextPassword !== 'string') {
      throw new Error('Password must be a non-empty string.');
    }

    // Hash the password using Argon2
    const hashedPassword = await argon2.hash(plainTextPassword, {
      type: argon2.argon2id, // Use Argon2id for secure hashing
    });

    console.log(`Generated Hash: ${hashedPassword}`); // Debug: Check if the hash starts with $

    // Connect to the database
    const connection = await connectDB();

    // SQL query to insert the user into the database
    const [rows] = await connection.execute('SELECT * FROM user WHERE username = ?', [username]);
    if (rows.length > 0) {
      return { success: false, error: 'User  already exists!' };
    }
    const [result] = await connection.execute(
      'INSERT INTO user (username, email, hashed_password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    return { success: true, message: 'User added successfully!' };
  } catch (error) {
    console.error('Error adding user:', error.message);
    return { success: false, error: error.message };
  }



};


module.exports = {
  addUser
};
