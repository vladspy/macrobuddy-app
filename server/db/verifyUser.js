const argon2 = require('argon2');
const { connectDB } = require('./db');  // Import your database connection

const verifyPassword = async (storedHash, inputPassword) => {
    try {
        const isMatch = await argon2.verify(storedHash, inputPassword);
        return isMatch;
    } catch (err) {
        console.error('Error verifying password:', err);
        throw err;
    }
};

/*const verifyUser = async (email, password) => {
    let connection;
    try {
        connection = await connectDB();  // Establish DB connection

        // Fetch the user's hashed password from the DB using the provided email
        const [rows] = await connection.execute('SELECT hashed_password FROM user WHERE email = ?', [email]);

        if (rows.length === 0) {
            console.log('User not found!');
            return false; // User not found
        }

        const storedHash = rows[0].hashed_password; // The hash stored in the database
        console.log('Stored Hash:', storedHash); // Ensure this is a valid Argon2 hash

        // Verify the input password against the stored hash
        const isValid = await verifyPassword(storedHash, password);

        if (isValid) {
            console.log('Password matches!');
        } else {
            console.log('Incorrect password!');
        }

        return isValid;  // Return the result (true or false)
    } catch (error) {
        console.error('Error verifying user:', error);
        return false;  // Return false in case of an error
    } finally {
        if (connection) {
            connection.release();  // Close DB connection
        }
    }
};*/
/*const verifyUser  = async (username, password) => {
    try {
      const connection = await connectDB();
      const [rows] = await connection.execute('SELECT * FROM user WHERE username = ?', [username]);
      if (rows.length === 0) {
        throw new Error('User  not found!');
      }
      const storedHash = rows[0].hashed_password;
      const isValid = await verifyPassword(storedHash, password);
      if (isValid) {
        return { success: true, message: 'User verified successfully!' };
      } else {
        throw new Error('Invalid username or password!');
      }
    } catch (error) {
      console.error('Error verifying user:', error.message);
      throw error;
    }
  };*/
  /*const verifyUser     = async (username, password) => {
    try {
      const connection = await connectDB();
      const [rows] = await connection.execute('SELECT * FROM user WHERE username = ?', [username]);
      if (rows.length === 0) {
        return { success: false, error: 'User  not found!' };
      }
      const storedHash = rows[0].hashed_password;
      const isValid = await verifyPassword(storedHash, password);
      if (isValid) {
        return { success: true, message: 'User  verified successfully!' };
      } else {
        return { success: false, error: 'Invalid username or password!' };
      }
    } catch (error) {
      console.error('Error verifying user:', error.message);
      return { success: false, error: 'Internal server error' };
    }
  };*/
  const verifyUser = async (email, password) => {
    try {
      const connection = await connectDB();
      const [rows] = await connection.execute('SELECT * FROM user WHERE email = ?', [email]);
  
      if (rows.length === 0) {
        return { success: false, error: 'User not found!' };
      }
  
      const storedHash = rows[0].hashed_password;
      const isValid = await verifyPassword(storedHash, password);
  
      if (isValid) {
        return { success: true, message: 'User verified successfully!' };
      } else {
        return { success: false, error: 'Invalid email or password.' };
      }
    } catch (error) {
      console.error('Error verifying user:', error.message);
      return { success: false, error: 'Internal server error' };
    }
  };
  



/*const verifyPassword = async (storedHash, inputPassword) => {
    try {
      const isMatch = await argon2.verify(storedHash, inputPassword);
      return isMatch;
    } catch (err) {
      console.error('Error verifying password:', err);
      throw err;
    }
  };
  
  const verifyUser   = async (username, password) => {
    try {
      const connection = await connectDB();
      const [rows] = await connection.execute('SELECT * FROM user WHERE username = ?', [username]);
      if (rows.length === 0) {
        return { success: false, error: 'User   not found!' };
      }
      const storedHash = rows[0].hashed_password;
      const isValid = await verifyPassword(storedHash, password);
      if (isValid) {
        return { success: true, message: 'User   verified successfully!' };
      } else {
        return { success: false, error: 'Invalid username or password.' };
      }
    } catch (error) {
      console.error('Error verifying user:', error.message);
      return { success: false, error: error.message };
    }
  };*/
  
  module.exports = { verifyUser  };