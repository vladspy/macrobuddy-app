// routes/macroRoutes.js

const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { addMacro, getMacros, deleteLastMacro } = require('../db/macros');

// --- Stub function to simulate USDA nutritional data lookup ---
// In a real implementation, you would query the USDA API here.
const getUSDAData = async (food_name) => {
  // Sanitize input: lowercase and trim whitespace
  const key = food_name.toLowerCase().trim();
  console.log("Looking up USDA data for key:", key);
  // Example static data for demonstration:
  const foods = {
    "apple": { caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 14, fatsPer100g: 0.2 },
    "banana": { caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatsPer100g: 0.3 },
    "chicken breast": { caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatsPer100g: 3.6 }
  };
  return foods[key] || { caloriesPer100g: 100, proteinPer100g: 2, carbsPer100g: 20, fatsPer100g: 1 };
};

// Validation schema for adding macros
const addMacrosSchema = Joi.object({
  userId: Joi.number().integer().required(),
  food_name: Joi.string().required(),
  weight: Joi.number().required() // weight in grams is required
});

// Validation schema for getting macros
const getMacrosSchema = Joi.object({
  userId: Joi.number().integer().required(),
});

// ✅ Route to add macros
router.post('/addMacros', async (req, res) => {
  // Validate the input
  const { error, value } = addMacrosSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const { userId, food_name, weight } = value;

  try {
    // Lookup USDA data for the food item
    const usdaData = await getUSDAData(food_name);
    // Calculate nutritional values based on weight (assumed to be in grams)
    // Formula: (per100g value) * (weight / 100)
    const calculatedMacros = {
      calories: usdaData.caloriesPer100g * (weight / 100),
      protein: usdaData.proteinPer100g * (weight / 100),
      carbs: usdaData.carbsPer100g * (weight / 100),
      fats: usdaData.fatsPer100g * (weight / 100)
    };
    console.log("Calculated macros:", calculatedMacros);

    // Insert the macro entry with the calculated nutritional values
    await addMacro(userId, { food_name, weight, ...calculatedMacros });
    res.status(201).json({ message: 'Macros added successfully!', data: calculatedMacros });
  } catch (err) {
    console.error('Error adding macros:', err.message);
    res.status(500).json({ error: 'Internal server error' });
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
    // Map the result to include a "time" property aliasing the "date" column.
    const result = macroData.map(item => ({
      ...item,
      time: item.date,
    }));
    res.status(200).json(result);
  } catch (err) {
    console.error('Error retrieving macros:', err.message);
    res.status(500).json({ error: 'Internal server error while retrieving macros.' });
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
    res.status(200).json({ message: 'Last macro deleted successfully!', deletedMacro });
  } catch (err) {
    console.error('Error deleting macro:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
