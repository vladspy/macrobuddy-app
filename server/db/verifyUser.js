const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const { connectDB } = require("./db");

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key_here";

const verifyPassword = async (storedHash, inputPassword) => {
  try {
    return await argon2.verify(storedHash, inputPassword);
  } catch (err) {
    console.error("Error verifying password:", err);
    throw err;
  }
};

const verifyUser = async (email, password) => {
  try {
    console.log("🔍 Login attempt:", email);

    // Adjusted query to select the proper field (user_id)
    const connection = await connectDB();
    const [rows] = await connection.execute(
      "SELECT user_id, email, hashed_password FROM user WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      console.log("❌ User not found:", email);
      return { success: false, error: "User not found!" };
    }

    const storedHash = rows[0].hashed_password;
    const isValid = await verifyPassword(storedHash, password);

    if (isValid) {
      // Use the correct column name: user_id
      const userId = rows[0].user_id;
      if (!userId) {
        console.error("❌ User ID not found in the database row.");
        return { success: false, error: "Internal server error" };
      }
      // Include userId in the JWT payload
      const token = jwt.sign(
        { userId: userId, email: rows[0].email },
        SECRET_KEY,
        { expiresIn: "1h" }
      );

      console.log("✅ User verified successfully:", email);
      return {
        success: true,
        message: "User verified successfully!",
        token,
        userId
      };
    } else {
      console.log("❌ Invalid credentials for:", email);
      return { success: false, error: "Invalid email or password." };
    }
  } catch (error) {
    console.error("❌ Error verifying user:", error.message);
    return { success: false, error: "Internal server error" };
  }
};

module.exports = { verifyUser };
