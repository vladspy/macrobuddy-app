// index.js

document.addEventListener("DOMContentLoaded", function () {
  // Elements for the MacroBuddy calculator
  const ageInput = document.getElementById("calc-age");
  const heightInput = document.getElementById("calc-height");
  const weightInput = document.getElementById("calc-weight");
  const exerciseInput = document.getElementById("calc-exercise");
  const intensityInput = document.getElementById("calc-intensity");
  const genderInputs = document.getElementsByName("gender");
  const resultGain = document.querySelector("#calc-target-gain span");
  const resultMaintain = document.querySelector("#calc-target-maintain span");
  const resultLose = document.querySelector("#calc-target-lose span");

  // Register the service worker, if supported
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((reg) => console.log("✅ Service Worker Registered:", reg))
        .catch((err) => console.log("❌ Service Worker Failed:", err));
    });
  }

  // Function to calculate BMR and update calorie targets
  function calculateBMR() {
    const age = parseInt(ageInput.value);
    const height = parseFloat(heightInput.value);
    const weight = parseFloat(weightInput.value);
    const exerciseDays = parseInt(exerciseInput.value);
    const intensityMinutes = parseInt(intensityInput.value);

    let gender = "male";
    for (const input of genderInputs) {
      if (input.checked) {
        gender = input.value;
        break;
      }
    }

    let bmr;
    // BMR calculation based on gender
    if (gender === "male") {
      bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
    } else {
      bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.330 * age;
    }

    // Calculate daily exercise minutes per session
    const dailyExerciseMinutes = (exerciseDays * intensityMinutes) / 7;

    // Function to calculate the activity factor
    function getActivityFactor(minutes) {
      if (minutes <= 0) {
        return 1.2; // Minimum factor for no exercise
      } else if (minutes >= 120) {
        return 1.9; // Maximum factor for 120+ minutes
      } else {
        // Linear scaling between 1.2 and 1.9
        return 1.2 + (minutes / 120) * (1.9 - 1.2);
      }
    }

    // Get activity factor based on total exercise minutes
    const activityFactor = getActivityFactor(dailyExerciseMinutes);

    // Calculate TDEE (Total Daily Energy Expenditure) using the activity factor
    const tdee = bmr * activityFactor;

    // Calculate targets
    const maintainCalories = Math.round(tdee);
    const gainCalories = Math.round(tdee + 500); // To gain weight
    const loseCalories = Math.round(tdee - 500); // To lose weight

    // Update results in the DOM
    resultMaintain.textContent = `${maintainCalories} calories`;
    resultGain.textContent = `${gainCalories} calories`;
    resultLose.textContent = `${loseCalories} calories`;
  }

  // Event listeners for inputs
  ageInput?.addEventListener("input", calculateBMR);
  heightInput?.addEventListener("input", calculateBMR);
  weightInput?.addEventListener("input", calculateBMR);
  exerciseInput?.addEventListener("input", calculateBMR);
  intensityInput?.addEventListener("input", calculateBMR);
  genderInputs.forEach((input) => input.addEventListener("change", calculateBMR));

  // Initial calculation
  calculateBMR();
});
