const SERVER_IP = "http://51.124.187.58:3000";  // ✅ Your Azure server

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

// ✅ Display multiple USDA search results
function displayFoodResults(foods) {
    let resultsContainer = document.getElementById("searchResults");
    resultsContainer.innerHTML = "";

    foods.forEach(food => {
        let resultItem = document.createElement("div");
        resultItem.classList.add("result-item");
        resultItem.innerHTML = `
            <strong>${food.product_name}</strong><br>
            Calories: ${food.energy_kcal} kcal, Protein: ${food.protein}g, Carbs: ${food.carbs}g, Fats: ${food.fats}g
        `;
        resultItem.onclick = () => {
            document.getElementById("foodSearch").value = food.product_name;
            resultsContainer.style.display = "none";
        };
        resultsContainer.appendChild(resultItem);
    });

    resultsContainer.style.display = "block";
}

// ✅ Hide results dropdown when clicking outside
document.addEventListener("click", function (event) {
    if (!event.target.closest("#searchResults") && !event.target.closest("#foodSearch")) {
        document.getElementById("searchResults").style.display = "none";
    }
});

// ✅ Show warning if offline
window.addEventListener("offline", () => {
    console.warn("📴 You are offline. Food search will not work.");
});
