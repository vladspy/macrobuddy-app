const SERVER_IP = "http://51.124.187.58:3000";  // ✅ Use your Azure server

document.getElementById("foodSearch").addEventListener("input", async function () {
    let query = this.value.trim().toLowerCase();
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
        // ✅ Ensure the API URL is correct
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
});

// ✅ Display all search results
function displayFoodResults(foods) {
    let resultsContainer = document.getElementById("searchResults");
    resultsContainer.innerHTML = "";

    foods.slice(0, 10).forEach(food => {
        let resultItem = document.createElement("div");
        resultItem.classList.add("result-item");
        resultItem.innerHTML = `
            <strong>${food.description}</strong><br>
            Calories: ${food.foodNutrients?.find(nutrient => nutrient.nutrientName === "Energy")?.value || "N/A"} kcal,
            Protein: ${food.foodNutrients?.find(nutrient => nutrient.nutrientName === "Protein")?.value || "N/A"}g,
            Carbs: ${food.foodNutrients?.find(nutrient => nutrient.nutrientName === "Carbohydrate, by difference")?.value || "N/A"}g,
            Fats: ${food.foodNutrients?.find(nutrient => nutrient.nutrientName === "Total lipid (fat)")?.value || "N/A"}g
        `;
        resultItem.onclick = () => {
            document.getElementById("foodSearch").value = food.description;
            resultsContainer.style.display = "none";
        };
        resultsContainer.appendChild(resultItem);
    });

    resultsContainer.style.display = "block";
}

// ✅ Hide dropdown when clicking outside
document.addEventListener("click", function (event) {
    if (!event.target.closest("#searchResults") && !event.target.closest("#foodSearch")) {
        document.getElementById("searchResults").style.display = "none";
    }
});

// ✅ Show warning if offline
window.addEventListener("offline", () => {
    console.warn("📴 You are offline. Food search will not work.");
});
