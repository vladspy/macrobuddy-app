const SERVER_IP = "http://51.124.187.58:3000"; // Your Azure server

// Global foodData object to store macros totals and food items
window.foodData = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fats: 0,
  foodItems: []
};

document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("userId");
  if (!userId || userId === "undefined" || userId === "null") {
    alert("❌ You need to log in first.");
    window.location.href = "login.html";
  } else {
    console.log("✅ Logged in as User ID:", userId);
    loadUserMacros(userId); // Fetch stored macros when page loads
  }
});

let debounceTimer;
document.getElementById("foodSearch").addEventListener("input", function () {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => fetchFoodResults(this.value.trim().toLowerCase()), 300);
});

// Fetch food results from USDA API
async function fetchFoodResults(query) {
  const resultsContainer = document.getElementById("searchResults");
  if (query.length < 2) {
    resultsContainer.style.display = "none";
    return;
  }
  if (!navigator.onLine) {
    console.warn("📴 Offline: Cannot search USDA database.");
    return;
  }
  try {
    const response = await fetch(`${SERVER_IP}/api/food/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    const foodArray = data.foods || [];
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

// Display search results dynamically
function displayFoodResults(foods) {
  const resultsContainer = document.getElementById("searchResults");
  resultsContainer.innerHTML = "";
  foods.forEach(food => {
    const resultItem = document.createElement("div");
    resultItem.classList.add("result-item");
    resultItem.innerHTML = `
      <strong>${food.product_name}</strong><br>
      Calories: ${food.calories} kcal, Protein: ${food.protein}g, Carbs: ${food.carbs}g, Fats: ${food.fats}g
      <button class="add-food-btn">➕ Add</button>
    `;
    resultItem.querySelector(".add-food-btn").addEventListener("click", () => addFoodToList(food));
    resultsContainer.appendChild(resultItem);
  });
  resultsContainer.style.display = "block";
}

// Add selected food to the list and database
async function addFoodToList(food) {
  let userId = localStorage.getItem("userId");
  if (!userId || isNaN(userId)) {
    console.error("❌ No valid user ID found. Ensure user is logged in.");
    alert("❌ Error: No valid user ID found. Please log in again.");
    localStorage.removeItem("userId");
    window.location.href = "login.html";
    return;
  }
  userId = parseInt(userId, 10);
  
  // Append food to the displayed list
  const foodList = document.getElementById("foodEntries");
  const foodItem = document.createElement("li");
  foodItem.textContent = `${food.product_name} - ${food.calories} kcal`;
  foodList.appendChild(foodItem);
  
  // Add food to the global foodData (with a timestamp) for local storage and later use in the dashboard
  window.foodData.foodItems.push({
    time: new Date().toLocaleTimeString(),
    food: food.product_name,
    calories: parseFloat(food.calories),
    protein: parseFloat(food.protein),
    carbs: parseFloat(food.carbs),
    fats: parseFloat(food.fats)
  });
  
  // Update totals and UI
  updateMacroTotals(food);
  
  // Save to server
  try {
    const response = await fetch(`${SERVER_IP}/api/macros/addMacros`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        food_name: food.product_name,
        protein: food.protein,
        carbs: food.carbs,
        fats: food.fats,
        calories: food.calories
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Error adding food to database");
    console.log("✅ Food added successfully:", food.product_name);
  } catch (error) {
    console.error("❌ Error adding food:", error);
  }
}

// Update total macros dynamically (and update localStorage)
function updateMacroTotals(food) {
  // Update global totals
  window.foodData.calories += parseFloat(food.calories);
  window.foodData.protein += parseFloat(food.protein);
  window.foodData.carbs += parseFloat(food.carbs);
  window.foodData.fats += parseFloat(food.fats);
  
  // Update UI elements
  document.getElementById("totalCalories").textContent = window.foodData.calories.toFixed(2);
  document.getElementById("totalProtein").textContent = window.foodData.protein.toFixed(2);
  document.getElementById("totalCarbs").textContent = window.foodData.carbs.toFixed(2);
  document.getElementById("totalFats").textContent = window.foodData.fats.toFixed(2);
  
  updateLocalStorageMacros();
}

// Store the global foodData object in localStorage
function updateLocalStorageMacros() {
  localStorage.setItem("foodData", JSON.stringify(window.foodData));
}

// Fetch and display user's stored food on page load
async function loadUserMacros(userId) {
  // Reset the global foodData and UI
  window.foodData = { calories: 0, protein: 0, carbs: 0, fats: 0, foodItems: [] };
  document.getElementById("foodEntries").innerHTML = "";
  document.getElementById("totalCalories").textContent = "0";
  document.getElementById("totalProtein").textContent = "0";
  document.getElementById("totalCarbs").textContent = "0";
  document.getElementById("totalFats").textContent = "0";
  
  try {
    const response = await fetch(`${SERVER_IP}/api/macros/getMacros?userId=${userId}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Error fetching macros");
    const foodList = document.getElementById("foodEntries");
    data.forEach(food => {
      const foodItem = document.createElement("li");
      foodItem.textContent = `${food.food_name} - ${food.calories} kcal`;
      foodList.appendChild(foodItem);
      
      // Update global foodData with each food entry
      window.foodData.foodItems.push({
        time: food.time || "-",
        food: food.food_name,
        calories: parseFloat(food.calories),
        protein: parseFloat(food.protein),
        carbs: parseFloat(food.carbs),
        fats: parseFloat(food.fats)
      });
      window.foodData.calories += parseFloat(food.calories);
      window.foodData.protein += parseFloat(food.protein);
      window.foodData.carbs += parseFloat(food.carbs);
      window.foodData.fats += parseFloat(food.fats);
      
      // Update totals in the UI
      document.getElementById("totalCalories").textContent = window.foodData.calories.toFixed(2);
      document.getElementById("totalProtein").textContent = window.foodData.protein.toFixed(2);
      document.getElementById("totalCarbs").textContent = window.foodData.carbs.toFixed(2);
      document.getElementById("totalFats").textContent = window.foodData.fats.toFixed(2);
    });
    updateLocalStorageMacros();
    console.log("✅ Loaded macros for user:", userId);
  } catch (error) {
    console.error("❌ Error loading macros:", error);
  }
}
