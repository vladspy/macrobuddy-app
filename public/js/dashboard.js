const SERVER_IP = "http://51.124.187.58:3000"; // Same server as in search.js

// Daily target values for each nutrient
const targets = {
  calories: 3434,
  protein: 172,
  carbs: 429,
  fats: 115,
};

async function loadDashboardMacros() {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    window.location.href = "login.html";
    return;
  }
  try {
    const response = await fetch(`${SERVER_IP}/api/macros/getMacros?userId=${userId}`);
    const data = await response.json();
    
    // ✅ If no data is found, initialize totals to zero instead of throwing an error
    if (!response.ok) {
      console.warn("⚠️ No macros found, initializing with zero values.");
    }

    // Calculate totals
    const totals = { calories: 0, protein: 0, carbs: 0, fats: 0 };

    if (Array.isArray(data) && data.length > 0) {
      data.forEach((food) => {
        totals.calories += parseFloat(food.calories);
        totals.protein += parseFloat(food.protein);
        totals.carbs += parseFloat(food.carbs);
        totals.fats += parseFloat(food.fats);
      });
    } else {
      console.warn("⚠️ No macro data available, showing empty values.");
    }

    // Update progress bar text values
    document.getElementById("energy").textContent = `${totals.calories.toFixed(2)} / ${targets.calories} kcal`;
    document.getElementById("protein").textContent = `${totals.protein.toFixed(2)} / ${targets.protein} g`;
    document.getElementById("carbs").textContent = `${totals.carbs.toFixed(2)} / ${targets.carbs} g`;
    document.getElementById("fat").textContent = `${totals.fats.toFixed(2)} / ${targets.fats} g`;

    // Calculate percentages (capped at 100%)
    const energyPercent = Math.min((totals.calories / targets.calories) * 100, 100);
    const proteinPercent = Math.min((totals.protein / targets.protein) * 100, 100);
    const carbsPercent = Math.min((totals.carbs / targets.carbs) * 100, 100);
    const fatsPercent = Math.min((totals.fats / targets.fats) * 100, 100);

    // Update the width of the progress bars
    const progressBars = document.querySelectorAll(".progress-bar .bar");
    if (progressBars.length >= 4) {
      progressBars[0].style.width = energyPercent + "%";
      progressBars[1].style.width = proteinPercent + "%";
      progressBars[2].style.width = carbsPercent + "%";
      progressBars[3].style.width = fatsPercent + "%";
    }

    // Populate the food table
    const tbody = document.querySelector(".food-table tbody");
    tbody.innerHTML = "";
    if (Array.isArray(data) && data.length > 0) {
      data.forEach((food) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${food.time || "-"}</td>
          <td>${food.food_name}</td>
          <td>${parseFloat(food.calories).toFixed(2)}</td>
          <td>${parseFloat(food.protein).toFixed(2)}</td>
          <td>${parseFloat(food.carbs).toFixed(2)}</td>
          <td>${parseFloat(food.fats).toFixed(2)}</td>
        `;
        tbody.appendChild(row);
      });
    } else {
      // ✅ If no macros are found, display a message instead of an empty table
      const row = document.createElement("tr");
      row.innerHTML = `<td colspan="6" style="text-align: center;">No macros logged yet.</td>`;
      tbody.appendChild(row);
    }

  } catch (error) {
    console.error("❌ Error loading dashboard macros:", error);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // Check if the user is logged in via your server endpoint
  try {
    const response = await fetch("/api/users/isLoggedIn", {
      method: "GET",
      credentials: "include",
    });
    const data = await response.json();
    if (!data.loggedIn) {
      window.location.href = "login.html";
    }
  } catch (error) {
    console.error("❌ Error checking login:", error);
  }
  // Load macros and update dashboard
  loadDashboardMacros();
});
