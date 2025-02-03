const { connectDB } = require('./db');

const getUserById = async (id) => {
  const connection = await connectDB();
  const [rows] = await connection.execute('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0];
};

const truncateUsers = async () => {
  const connection = await connectDB();

  // Disable foreign key checks, truncate, and re-enable foreign key checks
  await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
  await connection.execute('TRUNCATE TABLE user');
  await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

  return { message: 'Users table has been truncated with foreign key checks disabled temporarily' };
};

module.exports = { getUserById, truncateUsers };

