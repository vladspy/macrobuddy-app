// db/macros.js
const { connectDB } = require('./db');

/**
 * Retrieve macros for a user from today's entries.
 * @param {number} userId - The ID of the user.
 * @returns {Promise<Array>} - Array of macros records for the user.
 */
const getMacros = async (userId) => {
  const connection = await connectDB();
  const [rows] = await connection.execute(
    `SELECT * FROM macros
     WHERE user_id = ?
       AND DATE(date) = CURDATE()`, // This condition filters for today's entries
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

  /**
   * IMPORTANT:
   * Your table should be (macro_id PK, user_id, food_name, calories, protein, carbs, fats, weight, date).
   * That means: 
   *    1) user_id
   *    2) food_name
   *    3) calories
   *    4) protein
   *    5) carbs
   *    6) fats
   *    7) weight
   *    8) date (auto-filled by default or with a DEFAULT CURRENT_TIMESTAMP, for example)
   *
   * Make sure your DB column order matches exactly the columns in this INSERT statement below.
   * Otherwise, if your actual "weight" column is physically before "calories" in the schema,
   * you need to reorder the statement or fix your table schema accordingly.
   */
  const [insertResult] = await connection.execute(
    `
      INSERT INTO macros 
      (user_id, food_name, calories, protein, carbs, fats, weight)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      userId,
      macros.food_name,
      macros.calories, // e.g. 156 if apple 300g
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
 * Delete the last macro entry for a user (by highest macro_id).
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

module.exports = {
  getMacros,
  addMacro,
  deleteLastMacro,
  truncateMacros
};
