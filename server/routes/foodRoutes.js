const express = require("express");
const axios = require("axios");
const router = express.Router();

const USDA_API_KEY = "43SJpLG8iVMBYI7vCelwHdK8up9kRSMYiubpMYMB"; // Replace with your USDA API key
const USDA_API_BASE = "https://api.nal.usda.gov/fdc/v1/foods/search";

/**
 * GET: /api/food/search?query=banana
 * Search for food items in the USDA database and return multiple matches.
 */
router.get("/search", async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ error: "Query parameter is required" });
        }

        console.log(`🔍 Searching USDA API for: ${query}`);

        // ✅ Request multiple results (pageSize = 10)
        const params = new URLSearchParams({
            query,
            pageSize: 10,  
            api_key: USDA_API_KEY
        });

        params.set("dataType", "Survey (FNDDS)");
        let paramString = params.toString().replace(/\(/g, "%28").replace(/\)/g, "%29");

        const url = `${USDA_API_BASE}?${paramString}`;
        console.log(`🧐 Final USDA API URL: ${url}`);

        const response = await axios.get(url);
        console.log("✅ USDA API response received!");

        if (!response.data.foods || response.data.foods.length === 0) {
            return res.status(404).json({ error: "No relevant match found" });
        }

        // ✅ Extract macronutrients for each food result
        const foodResults = response.data.foods.map(foodItem => ({
            product_name: foodItem.description,
            ...extractMacronutrients(foodItem)
        }));

        res.json({ foods: foodResults });
    } catch (error) {
        console.error(`❌ Error fetching USDA food data:`, error.response?.data || error.message);
        res.status(500).json({ error: "Failed to retrieve food data" });
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

    if (!foodItem.foodNutrients) return macronutrients;

    foodItem.foodNutrients.forEach(nutrient => {
        switch (nutrient.nutrientName) {
            case "Energy":
                macronutrients.energy_kcal = nutrient.value;
                break;
            case "Protein":
                macronutrients.protein = nutrient.value;
                break;
            case "Carbohydrate, by difference":
                macronutrients.carbs = nutrient.value;
                break;
            case "Total lipid (fat)":
                macronutrients.fats = nutrient.value;
                break;
        }
    });

    return macronutrients;
}

module.exports = router;
