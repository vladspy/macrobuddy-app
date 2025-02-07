// routes/macroRoutes.js
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const axios = require('axios');
const { addMacro, getMacros, deleteLastMacro } = require('../db/macros');

// Use the internal USDA search API from foodRoutes.js
const USDA_SEARCH_API = "http://localhost:3000/api/food/search"; // Adjust if hosted elsewhere

// Validation schema for adding macros
const addMacrosSchema = Joi.object({
  userId:    Joi.number().integer().required(),
  food_name: Joi.string().required(),
  weight:    Joi.number().required() // weight in grams is required
});

// Validation schema for getting macros
const getMacrosSchema = Joi.object({
  userId: Joi.number().integer().required(),
});

// ✅ Route to add macros
router.post('/addMacros', async (req, res) => {
  // Validate input
  const { error, value } = addMacrosSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const { userId, food_name, weight } = value;

  try {
    // 🔍 Fetch USDA food data from foodRoutes.js
    console.log(`Requesting USDA data for: ${food_name}`);
    const response = await axios.get(`${USDA_SEARCH_API}?query=${encodeURIComponent(food_name)}`);

    if (!response.data.foods || response.data.foods.length === 0) {
      return res.status(404).json({ error: "No USDA data found for the given food item." });
    }

    // ✅ Extract first food item data
    const usdaData = response.data.foods[0];

    // 🔢 Calculate macronutrients based on weight
    const calculatedMacros = {
      calories: usdaData.calories * (weight / 100),
      protein:  usdaData.protein  * (weight / 100),
      carbs:    usdaData.carbs    * (weight / 100),
      fats:     usdaData.fats     * (weight / 100),
    };

    // ✅ Save to database
    await addMacro(userId, { 
      food_name, 
      weight, 
      ...calculatedMacros 
    });

    return res.status(201).json({ 
      message: 'Macros added successfully!', 
      data: calculatedMacros 
    });
  } catch (err) {
    console.error('Error adding macros:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ Route to get macros
router.get('/getMacros', async (req, res) => {
  const { error, value } = getMacrosSchema.validate(req.query);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { userId } = value;

  try {
    const macroData = await getMacros(userId);
    if (!macroData || macroData.length === 0) {
      return res.status(404).json({ error: 'No macro data found for the given user.' });
    }

    // Map results to include a "time" property aliasing the "date" column
    const result = macroData.map(item => ({
      ...item,
      time: item.date,
    }));
    return res.status(200).json(result);
  } catch (err) {
    console.error('Error retrieving macros:', err.message);
    return res.status(500).json({ error: 'Internal server error while retrieving macros.' });
  }
});

// ✅ Route to delete the last macro entry for a user
router.delete('/deleteLast', async (req, res) => {
  const userId = parseInt(req.query.userId, 10);
  if (!userId) {
    return res.status(400).json({ error: "Missing or invalid userId" });
  }
  try {
    const deletedMacro = await deleteLastMacro(userId);
    return res.status(200).json({ 
      message: 'Last macro deleted successfully!', 
      deletedMacro 
    });
  } catch (err) {
    console.error('Error deleting macro:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
