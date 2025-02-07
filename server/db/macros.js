const { connectDB } = require('./db');

const getMacros = async (userId) => {
  const connection = await connectDB();
  const [rows] = await connection.execute(
    `SELECT * FROM macros
     WHERE user_id = ?
       AND DATE(date) = CURDATE()`,
    [userId]
  );
  connection.release();
  return rows;
};

const addMacro = async (userId, macros) => {
  const connection = await connectDB();

  const [userRows] = await connection.execute(
    'SELECT * FROM user WHERE user_id = ?',
    [userId]
  );
  if (userRows.length === 0) {
    connection.release();
    throw new Error(`User with ID ${userId} does not exist`);
  }

  // Ensure column order matches the database schema
  const [insertResult] = await connection.execute(
    `INSERT INTO macros
     (user_id, food_name, calories, protein, carbs, fats, weight)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      macros.food_name,
      macros.calories,
      macros.protein,
      macros.carbs,
      macros.fats,
      macros.weight
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
