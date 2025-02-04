require('dotenv').config();
const express = require('express');
const session = require('express-session'); // ✅ Add session support
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const userRoutes = require('./routes/userRoutes');
const macrosRoutes = require('./routes/macrosRoutes');
const PIRoutes = require('./routes/PIRoutes');
const foodRoutes = require('./routes/foodRoutes');

const app = express();

// ✅ Set up sessions
app.use(session({
    secret: 'your-secret-key',  // Change to a strong secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true } // Set secure: true for HTTPS
}));


// ✅ Serve static frontend files
app.use(express.static(path.join(__dirname, '../public')));

// ✅ Redirect root to index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: "*",
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

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running at http://51.124.187.58:${PORT}`);
});
