// personalInfo.js

const { connectDB } = require('./db');

/**
 * Insert personal information for a user.
 * 
 * @param {object} data 
 * @param {number} data.userId 
 * @param {number|null} data.sex 
 * @param {number} data.height 
 * @param {number} data.age 
 * @param {number} data.weight 
 * @param {string} data.firstName 
 * @param {string} data.lastName 
 * @returns {Promise<{success: boolean, insertId?: number, error?: string}>}
 */
async function insertPersonalInfo({
  userId,
  sex,
  height,
  age,
  weight,
  firstName,
  lastName,
}) {
  let connection;

  try {
    // Basic validation
    if (!userId || typeof userId !== 'number') {
      throw new Error('userId must be a valid number.');
    }
    if (sex !== null && ![0, 1].includes(sex)) {
      throw new Error('Sex must be 0 or 1.');
    }
    if (!height || height <= 0) {
      throw new Error('Height must be a positive number.');
    }
    if (!age || age <= 0 || age > 120) {
      throw new Error('Age must be between 1 and 120.');
    }
    if (!weight || weight <= 0) {
      throw new Error('Weight must be a positive number.');
    }
    if (!firstName || !lastName) {
      throw new Error('First and last names must be non-empty.');
    }

    connection = await connectDB();

    // Insert the data into personalinformation
    const sql = `
      INSERT INTO personalinformation
      (user_id, sex, height, age, weight, first_name, last_name)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await connection.execute(sql, [
      userId,
      sex,
      height,
      age,
      weight,
      firstName.trim(),
      lastName.trim(),
    ]);

    return { success: true, insertId: result.insertId };
  } catch (error) {
    console.error('Error inserting personal information:', error.message);
    return { success: false, error: error.message };
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

/**
 * Retrieve personal information for a user.
 * 
 * @param {number} userId 
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
async function getPersonalInfo(userId) {
  let connection;
  try {
    if (!userId || typeof userId !== 'number') {
      throw new Error('Invalid userId for getPersonalInfo.');
    }

    connection = await connectDB();

    // Fetch the MOST RECENT personal info for that user (if you want just one record)
    const sql = `
      SELECT * 
      FROM personalinformation 
      WHERE user_id = ?
      ORDER BY PI_id DESC
      LIMIT 1
    `;
    const [rows] = await connection.execute(sql, [userId]);

    if (rows.length === 0) {
      return { success: false, error: 'No data found for the given userId.' };
    }

    return { success: true, data: rows[0] };
  } catch (error) {
    console.error('Error retrieving personal information:', error.message);
    return { success: false, error: error.message };
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

module.exports = { insertPersonalInfo, getPersonalInfo };
