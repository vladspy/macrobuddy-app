const SERVER_IP = "http://51.124.187.58:3000"; // ✅ Your Azure server

document.addEventListener("DOMContentLoaded", () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        alert("❌ You need to log in first.");
        window.location.href = "login.html";
    } else {
        console.log("✅ Logged in as User ID:", userId);
        loadUserMacros(userId); // ✅ Fetch stored macros when page loads
    }
});

let debounceTimer;

// ✅ Attach event listener to food search input
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
    let userId = localStorage.getItem("userId");

    if (!userId || isNaN(userId)) {
        console.error("❌ No valid user ID found. Ensure user is logged in.");
        alert("❌ Error: No valid user ID found. Please log in again.");
        localStorage.removeItem("userId"); // Clear any invalid data
        window.location.href = "login.html";
        return;
    }

    userId = parseInt(userId, 10); // ✅ Ensure userId is a number

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
                food_name: food.product_name,
                protein: food.protein,
                carbs: food.carbs,
                fats: food.fats,
                calories: food.energy_kcal
            })
        });

        let data = await response.json();
        if (!response.ok) throw new Error(data.error || "Error adding food to database");

        console.log("✅ Food added successfully:", food.product_name);
    } catch (error) {
        console.error("❌ Error adding food:", error);
    }
}

// ✅ Update total macros dynamically
function updateMacroTotals(food) {
    let totalCalories = document.getElementById("totalCalories");
    let totalProtein = document.getElementById("totalProtein");
    let totalCarbs = document.getElementById("totalCarbs");
    let totalFats = document.getElementById("totalFats");

    totalCalories.textContent = (parseFloat(totalCalories.textContent) + food.energy_kcal).toFixed(2);
    totalProtein.textContent = (parseFloat(totalProtein.textContent) + food.protein).toFixed(2);
    totalCarbs.textContent = (parseFloat(totalCarbs.textContent) + food.carbs).toFixed(2);
    totalFats.textContent = (parseFloat(totalFats.textContent) + food.fats).toFixed(2);
}

// ✅ Fetch and display user's stored food on page load
async function loadUserMacros(userId) {
    try {
        let response = await fetch(`${SERVER_IP}/api/macros/getMacros?userId=${userId}`);
        let data = await response.json();

        if (!response.ok) throw new Error(data.error || "Error fetching macros");

        let foodList = document.getElementById("foodEntries");
        foodList.innerHTML = ""; // ✅ Clear previous entries

        data.forEach(food => {
            let foodItem = document.createElement("li");
            foodItem.textContent = `${food.food_name} - ${food.calories} kcal`;
            foodList.appendChild(foodItem);

            updateMacroTotals(food);
        });

        console.log("✅ Loaded macros for user:", userId);
    } catch (error) {
        console.error("❌ Error loading macros:", error);
    }
}
