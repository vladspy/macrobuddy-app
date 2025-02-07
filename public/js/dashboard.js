// dashboard.js

const SERVER_IP = "http://51.124.187.58:3000"; // Same server as in search.js

// If personal info not found, fallback to these defaults
let defaultTargets = {
  calories: 2500,
  protein:  125,
  carbs:    313,
  fats:     69
};

/**
 * Helper to compute BMR -> TDEE -> macros from personal info
 */
function computeTargetsFromPersonalInfo(piData) {
  // piData from DB: { user_id, sex, height, age, weight, goal, ... }
  // sex => 0 (female), 1 (male)
  const { sex, height, age, weight, goal } = piData;
  let gender = (sex === 1) ? "male" : "female";

  // BMR (Mifflin-St Jeor)
  let bmr;
  if (gender === "male") {
    bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  } else {
    bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.330 * age;
  }

  // We don't have a user-chosen activity factor from DB, so pick 1.3:
  let activityFactor = 1.3;
  let tdee = bmr * activityFactor;

  // Apply the user's goal from the DB
  if (goal === "gain") {
    tdee += 500;
  } else if (goal === "lose") {
    tdee -= 500;
  }
  // else "maintaining" => do nothing

  // Convert TDEE to daily macros (30% protein, 40% carbs, 30% fat)
  let calFromProtein = 0.3 * tdee;
  let calFromCarbs   = 0.4 * tdee;
  let calFromFats    = 0.3 * tdee;

  let protein = calFromProtein / 4;
  let carbs   = calFromCarbs   / 4;
  let fats    = calFromFats    / 9;

  return {
    calories: Math.round(tdee),
    protein:  Math.round(protein),
    carbs:    Math.round(carbs),
    fats:     Math.round(fats)
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

    // Debug:
    console.log("Macros data received:", data);

    // If no data is found, initialize totals to zero
    if (!response.ok) {
      console.warn("⚠️ No macros found, initializing with zero values.");
    }

    // Calculate totals
    const totals = { calories: 0, protein: 0, carbs: 0, fats: 0 };

    if (Array.isArray(data) && data.length > 0) {
      data.forEach((food) => {
        totals.calories += parseFloat(food.calories);
        totals.protein  += parseFloat(food.protein);
        totals.carbs    += parseFloat(food.carbs);
        totals.fats     += parseFloat(food.fats);
      });
    } else {
      console.warn("⚠️ No macro data available, showing empty values.");
    }

    // Update progress bar text values
    document.getElementById("energy").textContent  = 
      `${totals.calories.toFixed(2)} / ${userTargets.calories} kcal`;
    document.getElementById("protein").textContent = 
      `${totals.protein.toFixed(2)} / ${userTargets.protein} g`;
    document.getElementById("carbs").textContent   = 
      `${totals.carbs.toFixed(2)} / ${userTargets.carbs} g`;
    document.getElementById("fat").textContent     = 
      `${totals.fats.toFixed(2)} / ${userTargets.fats} g`;

    // Calculate percentages (capped at 100%)
    const energyPercent  = Math.min((totals.calories / userTargets.calories) * 100, 100);
    const proteinPercent = Math.min((totals.protein  / userTargets.protein)  * 100, 100);
    const carbsPercent   = Math.min((totals.carbs    / userTargets.carbs)    * 100, 100);
    const fatsPercent    = Math.min((totals.fats     / userTargets.fats)     * 100, 100);

    // Update the width of the progress bars
    const progressBars = document.querySelectorAll(".progress-bar .bar");
    if (progressBars.length >= 4) {
      progressBars[0].style.width = energyPercent  + "%";
      progressBars[1].style.width = proteinPercent + "%";
      progressBars[2].style.width = carbsPercent   + "%";
      progressBars[3].style.width = fatsPercent    + "%";
    }

    // Populate the food table
    const tbody = document.querySelector(".food-table tbody");
    tbody.innerHTML = "";

    if (Array.isArray(data) && data.length > 0) {
      data.forEach((food) => {
        // Use the "date" field to show when the item was added.
        const dateAdded = food.date 
          ? new Date(food.date).toLocaleString() 
          : "-";

        // Weight may be null; show as "-" if not provided.
        const weightDisplay = 
          (food.weight !== null && food.weight !== undefined) 
            ? food.weight 
            : "-";

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${dateAdded}</td>
          <td>${food.food_name}</td>
          <td>${parseFloat(food.calories).toFixed(2)}</td>
          <td>${parseFloat(food.protein).toFixed(2)}</td>
          <td>${parseFloat(food.carbs).toFixed(2)}</td>
          <td>${parseFloat(food.fats).toFixed(2)}</td>
          <td>${weightDisplay}</td>
        `;
        tbody.appendChild(row);
      });
    } else {
      const row = document.createElement("tr");
      row.innerHTML = `<td colspan="7" style="text-align: center;">No macros logged yet.</td>`;
      tbody.appendChild(row);
    }
  } catch (error) {
    console.error("❌ Error loading dashboard macros:", error);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // Check if the user is logged in
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
