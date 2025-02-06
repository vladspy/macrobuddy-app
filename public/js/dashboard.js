// dashboard.js

const SERVER_IP = "http://51.124.187.58:3000"; // Same server as in search.js

// We remove the static targets object and compute them dynamically
// If for some reason personal info not found, fallback to these defaults
let defaultTargets = {
  calories: 2500,
  protein: 125, // example
  carbs: 313,   // example
  fats: 69      // example
};

/**
 * A small helper to compute BMR -> TDEE -> macros from personal info
 * Note: Adjust logic as you see fit for your application.
 */
function computeTargetsFromPersonalInfo(piData) {
  // piData object structure from DB: { user_id, sex, height, age, weight, ... }
  // sex => 0 (female), 1 (male)
  // For demo, assume no detailed activity level from DB; we pick a minimal factor or something
  const { sex, height, age, weight } = piData;

  let gender = sex === 1 ? "male" : "female";

  // BMR (Mifflin-St Jeor)
  let bmr;
  if (gender === "male") {
    bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  } else {
    bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.330 * age;
  }

  // We don't have a user-chosen activity factor from DB, so pick something modest, e.g. 1.3:
  let activityFactor = 1.3;
  let tdee = bmr * activityFactor;

  // If you want to handle “gaining” or “losing,” you’d do tdee += or -= 500 here if stored.
  // For now, let’s assume “maintaining.”

  // Convert TDEE to daily macros in a ratio. Example ratio:
  // 30% protein, 40% carbs, 30% fat. Each gram protein/carb ~4kcal, fat ~9kcal
  // Adjust as needed:
  let calFromProtein = 0.3 * tdee;
  let calFromCarbs = 0.4 * tdee;
  let calFromFats = 0.3 * tdee;

  let protein = calFromProtein / 4;
  let carbs = calFromCarbs / 4;
  let fats = calFromFats / 9;

  return {
    calories: Math.round(tdee),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fats: Math.round(fats)
  };
}

async function loadDashboardMacros() {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    window.location.href = "login.html";
    return;
  }

  // 1) Fetch personal info to compute targets
  let userTargets = { ...defaultTargets };
  try {
    const piResponse = await fetch(`${SERVER_IP}/api/personal-info/getPI?userId=${userId}`);
    if (piResponse.ok) {
      const piData = await piResponse.json();
      // If we got personal info, compute TDEE + macros from that
      if (piData && piData.user_id) {
        userTargets = computeTargetsFromPersonalInfo(piData);
      }
    }
  } catch (e) {
    console.warn("Could not fetch personal info, using defaults");
  }

  // 2) Fetch user’s macros for the day
  try {
    const response = await fetch(`${SERVER_IP}/api/macros/getMacros?userId=${userId}`);
    const data = await response.json();

    // If no data is found, initialize totals to zero
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
    document.getElementById("energy").textContent = `${totals.calories.toFixed(2)} / ${userTargets.calories} kcal`;
    document.getElementById("protein").textContent = `${totals.protein.toFixed(2)} / ${userTargets.protein} g`;
    document.getElementById("carbs").textContent = `${totals.carbs.toFixed(2)} / ${userTargets.carbs} g`;
    document.getElementById("fat").textContent = `${totals.fats.toFixed(2)} / ${userTargets.fats} g`;

    // Calculate percentages (capped at 100%)
    const energyPercent = Math.min((totals.calories / userTargets.calories) * 100, 100);
    const proteinPercent = Math.min((totals.protein / userTargets.protein) * 100, 100);
    const carbsPercent = Math.min((totals.carbs / userTargets.carbs) * 100, 100);
    const fatsPercent = Math.min((totals.fats / userTargets.fats) * 100, 100);

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
