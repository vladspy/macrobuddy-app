// db/macros.js

const { connectDB } = require('./db');

/**
 * Retrieve macros for a user.
 * @param {number} userId - The ID of the user.
 * @returns {Promise<Array>} - Array of macros records for the user.
 */
const getMacros = async (userId) => {
  const connection = await connectDB();
  const [rows] = await connection.execute(
    'SELECT * FROM macros WHERE user_id = ?',
    [userId]
  );
  connection.release();
  return rows;
};

/**
 * Add macro data for a user.
 * Checks if the user exists first (by user_id).
 * @param {number} userId - The user ID.
 * @param {object} macros - The macros object (protein, carbs, fats, calories).
 * @returns {Promise<object>} - The result of the INSERT query.
 */
const addMacro = async (userId, macros) => {
  const connection = await connectDB();

  // Ensure user exists before inserting
  const [userRows] = await connection.execute(
      'SELECT * FROM user WHERE user_id = ?',
      [userId]
  );

  if (userRows.length === 0) {
      connection.release();
      throw new Error(`User with ID ${userId} does not exist`);
  }

  // ✅ Ensure `food_name` is included in the INSERT statement
  const [insertResult] = await connection.execute(
      'INSERT INTO macros (user_id, food_name, protein, carbs, fats, calories) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, macros.food_name, macros.protein, macros.carbs, macros.fats, macros.calories]
  );

  connection.release();
  return insertResult;
};

/**
 * Truncate the macros table (for tests).
 * @returns {Promise<{message: string}>}
 */
const truncateMacros = async () => {
  const connection = await connectDB();
  await connection.execute('TRUNCATE TABLE macros');
  connection.release();
  return { message: 'Macros table has been truncated' };
};

module.exports = { getMacros, addMacro, truncateMacros };
