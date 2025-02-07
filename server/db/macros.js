const { connectDB } = require('./db');

/**
 * Retrieve macros for a user.
 * @param {number} userId - The ID of the user.
 * @returns {Promise<Array>} - Array of macros records for the user.
 */
const getMacros = async (userId) => {
  const connection = await connectDB();
  const [rows] = await connection.execute(
    `SELECT * FROM macros 
     WHERE user_id = ? 
       AND DATE(date) = CURDATE()`,  // This condition filters for entries from today
    [userId]
  );
  connection.release();
  return rows;
};

/**
 * Add macro data for a user.
 * Checks if the user exists first (by user_id).
 * @param {number} userId - The user ID.
 * @param {object} macros - The macros object (food_name, protein, carbs, fats, calories, weight).
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

  // IMPORTANT: Adjust the column order to match your table's schema.
  // For a table defined as (macro_id, user_id, food_name, calories, protein, carbs, fats, weight, date),
  // the INSERT should be:
  const [insertResult] = await connection.execute(
      'INSERT INTO macros (user_id, food_name, calories, protein, carbs, fats, weight) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        userId,
        macros.food_name,
        macros.calories, // calculated calories
        macros.protein,
        macros.carbs,
        macros.fats,
        macros.weight || null
      ]
  );

  connection.release();
  return insertResult;
};

/**
 * Delete the last macro entry for a user.
 * @param {number} userId - The user ID.
 * @returns {Promise<object>} - The deleted macro record.
 */
const deleteLastMacro = async (userId) => {
  const connection = await connectDB();

  // Fetch the last macro record using the primary key `macro_id`
  const [rows] = await connection.execute(
    'SELECT * FROM macros WHERE user_id = ? ORDER BY macro_id DESC LIMIT 1',
    [userId]
  );

  if (rows.length === 0) {
    connection.release();
    throw new Error("No macro entries found to delete.");
  }

  const lastMacro = rows[0];

  // Delete the entry using macro_id
  await connection.execute(
    'DELETE FROM macros WHERE macro_id = ?',
    [lastMacro.macro_id]
  );

  connection.release();
  return lastMacro;
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

module.exports = { getMacros, addMacro, deleteLastMacro, truncateMacros };
