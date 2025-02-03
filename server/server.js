require('dotenv').config(); // Load environment variables
const { connectDB } = require('./db/db'); // Import the DB module
const path = require('path'); 

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import CORS
const userRoutes = require('./routes/userRoutes');
const macrosRoutes = require('./routes/macrosRoutes');
const PIRoutes = require('./routes/PIRoutes');
const foodRoutes = require('./routes/foodRoutes');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT|| 3000; // Use environment variable for port


// Middleware
app.use(cors({
  origin: "*", // Change this to your frontend URL for security
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(bodyParser.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/macros', macrosRoutes);
app.use('/api/personal-info', PIRoutes);
app.use('/api/food', foodRoutes);
console.log("Personal Info Routes loaded!");
console.log('✅ Running the UPDATED server.js file!');

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to MacroBuddy API!');
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
module.exports = app;
