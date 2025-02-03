const express = require('express');
const axios = require('axios');
const router = express.Router();

const USDA_API_KEY = '43SJpLG8iVMBYI7vCelwHdK8up9kRSMYiubpMYMB'; // Replace with your USDA API key
const USDA_API_BASE = 'https://api.nal.usda.gov/fdc/v1/foods/search';

/**
 * GET: /api/food/search?query=banana
 * Search for food items in the USDA database and extract macronutrient information.
 */
router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;

        // Validate the query parameter
        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }

        console.log(`🔍 Searching USDA API for: ${query}`);

        // Construct the URL with properly encoded parameters
        const params = new URLSearchParams({
            query,       // e.g. "banana"
            pageSize: 1,
            api_key: USDA_API_KEY
        });

        // Use set() instead of append() to ensure only one dataType (no brackets, no duplicates)
        params.set('dataType', 'Survey (FNDDS)');

        // Convert params to string, then encode parentheses manually
        let paramString = params.toString();
        paramString = paramString
          .replace(/\(/g, '%28') // encode '('
          .replace(/\)/g, '%29'); // encode ')'

        // Construct the final URL
        const url = `${USDA_API_BASE}?${paramString}`;
        console.log(`🧐 Final USDA API URL: ${url}`);

        // Make a request to the USDA API
        const response = await axios.get(url);

        console.log('✅ USDA API response received!');

        // Check if the response contains food data
        if (!response.data.foods || response.data.foods.length === 0) {
            return res.status(404).json({ error: 'No relevant match found' });
        }

        // Extract the first food item from the response
        const foodItem = response.data.foods[0];

        // Extract macronutrients from the food item
        const macronutrients = extractMacronutrients(foodItem);

        // Send the response with the food name and macronutrients
        res.json({
            product_name: foodItem.description,
            ...macronutrients
        });
    } catch (error) {
        // Log the error and send a 500 response
        console.error(`❌ Error fetching USDA food data:`, error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to retrieve food data' });
    }
});

/**
 * Function to extract macronutrients from USDA API response
 */
function extractMacronutrients(foodItem) {
    const macronutrients = {
        energy_kcal: 0,
        protein: 0,
        carbs: 0,
        fats: 0
    };

    // Check if the food item has nutrient data
    if (!foodItem.foodNutrients) {
        return macronutrients;
    }

    // Loop through the nutrients and extract macronutrient values
    foodItem.foodNutrients.forEach(nutrient => {
        switch (nutrient.nutrientName) {
            case 'Energy':
                macronutrients.energy_kcal = nutrient.value;
                break;
            case 'Protein':
                macronutrients.protein = nutrient.value;
                break;
            case 'Carbohydrate, by difference':
                macronutrients.carbs = nutrient.value;
                break;
            case 'Total lipid (fat)':
                macronutrients.fats = nutrient.value;
                break;
        }
    });

    return macronutrients;
}

module.exports = router;
