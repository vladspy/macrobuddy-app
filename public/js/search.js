const SERVER_IP = "http://51.124.187.58:3000"; // ✅ Your Azure server

let debounceTimer;
document.getElementById("foodSearch").addEventListener("input", function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fetchFoodResults(this.value.trim().toLowerCase()), 300);
});

// ✅ Fetch food results from USDA API
async function fetchFoodResults(query) {
    let resultsContainer = document.getElementById("searchResults");

    if (query.length < 2) {
        resultsContainer.style.display = "none";
        return;
    }

    if (!navigator.onLine) {
        console.warn("📴 Offline: Cannot search USDA database.");
        return;
    }

    try {
        let response = await fetch(`${SERVER_IP}/api/food/search?query=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        let data = await response.json();
        let foodArray = data.foods || [];

        if (foodArray.length === 0) {
            resultsContainer.innerHTML = "<p>No results found.</p>";
            resultsContainer.style.display = "block";
            return;
        }

        displayFoodResults(foodArray);
    } catch (error) {
        console.error("❌ Error fetching food data:", error);
        resultsContainer.innerHTML = "<p>Error fetching data.</p>";
        resultsContainer.style.display = "block";
    }
}

// ✅ Display search results dynamically
function displayFoodResults(foods) {
    let resultsContainer = document.getElementById("searchResults");
    resultsContainer.innerHTML = "";

    foods.forEach(food => {
        let resultItem = document.createElement("div");
        resultItem.classList.add("result-item");
        resultItem.innerHTML = `
            <strong>${food.product_name}</strong><br>
            Calories: ${food.energy_kcal} kcal, Protein: ${food.protein}g, Carbs: ${food.carbs}g, Fats: ${food.fats}g
            <button class="add-food-btn">➕ Add</button>
        `;
        resultItem.querySelector(".add-food-btn").addEventListener("click", () => addFoodToList(food));
        resultsContainer.appendChild(resultItem);
    });

    resultsContainer.style.display = "block";
}

// ✅ Add selected food to the list and database
async function addFoodToList(food) {
    let userId = 1; // ✅ Replace with logged-in user ID
    let foodList = document.getElementById("foodEntries");

    let foodItem = document.createElement("li");
    foodItem.textContent = `${food.product_name} - ${food.energy_kcal} kcal`;
    foodList.appendChild(foodItem);

    updateMacroTotals(food);

    try {
        let response = await fetch(`${SERVER_IP}/api/macros/addMacros`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId,
                protein: food.protein,
                carbs: food.carbs,
                fats: food.fats,
                calories: food.energy_kcal,
            })
        });

        let data = await response.json();
        if (!response.ok) throw new Error(data.error || "Error adding food to database");
    } catch (error) {
        console.error("❌ Error adding food:", error);
    }
}

// ✅ Update total macros dynamically
function updateMacroTotals(food) {
    document.getElementById("totalCalories").textContent =
        parseFloat(document.getElementById("totalCalories").textContent) + food.energy_kcal;
    document.getElementById("totalProtein").textContent =
        parseFloat(document.getElementById("totalProtein").textContent) + food.protein;
    document.getElementById("totalCarbs").textContent =
        parseFloat(document.getElementById("totalCarbs").textContent) + food.carbs;
    document.getElementById("totalFats").textContent =
        parseFloat(document.getElementById("totalFats").textContent) + food.fats;
}

// ✅ Fetch and display user's stored food on page load
async function loadUserMacros() {
    let userId = 1; // ✅ Replace with actual logged-in user ID
    try {
        let response = await fetch(`${SERVER_IP}/api/macros/getMacros?userId=${userId}`);
        let data = await response.json();

        if (!response.ok) throw new Error(data.error || "Error fetching macros");

        data.forEach(food => {
            let foodList = document.getElementById("foodEntries");
            let foodItem = document.createElement("li");
            foodItem.textContent = `${food.product_name} - ${food.calories} kcal`;
            foodList.appendChild(foodItem);

            updateMacroTotals(food);
        });
    } catch (error) {
        console.error("❌ Error loading macros:", error);
    }
}

// ✅ Load stored food when the page loads
document.addEventListener("DOMContentLoaded", loadUserMacros);
