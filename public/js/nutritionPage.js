// nutritionPage.js

const SERVER_IP = "http://51.124.187.58:3000";

function calculateNutrition() {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    alert("No user found in localStorage. Please log in again.");
    return;
  }

  // Get form values
  const age = parseInt(document.getElementById("pi-age").value, 10);
  const sexSelect = document.getElementById("pi-sex").value; // 'Male' or 'Female'
  const weight = parseFloat(document.getElementById("pi-weight").value);
  const height = parseFloat(document.getElementById("pi-height").value);
  const firstName = document.getElementById("pi-firstName").value;
  const lastName = document.getElementById("pi-lastName").value;

  // Convert sex to 0 or 1 for DB
  const sex = (sexSelect.toLowerCase() === "male") ? 1 : 0;

  // Basic validation
  if (!age || !weight || !height || !firstName || !lastName) {
    alert("Please fill out all fields correctly before submitting.");
    return;
  }

  // We only have a POST route to "add" personal info, so we can just insert a new row each time.
  const payload = {
    userId: Number(userId),
    sex,
    height,
    age,
    weight,
    firstName,
    lastName
  };

  fetch(`${SERVER_IP}/api/personal-info/addPI`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert(`Error: ${data.error}`);
      } else {
        alert("Nutrition targets (Personal Info) saved successfully!");
        // After successful insert, you might want to go back to the dashboard
        window.location.href = "index.html";
      }
    })
    .catch(err => {
      console.error(err);
      alert("Error saving personal info");
    });
}

document.addEventListener("DOMContentLoaded", function() {
  // 1) On load, fetch existing personal info
  const userId = localStorage.getItem("userId");
  if (!userId) {
    // Possibly redirect or alert
    console.warn("No user found in localStorage. Perhaps not logged in?");
    return;
  }

  fetch(`${SERVER_IP}/api/personal-info/getPI?userId=${userId}`)
    .then(res => res.json())
    .then(data => {
      if (!data || data.error) {
        // no existing personal info
        console.warn("No existing personal info found or error retrieving it.");
        return;
      }
      // fill form fields with data
      document.getElementById("pi-age").value = data.age;
      document.getElementById("pi-sex").value = (data.sex === 1) ? "Male" : "Female";
      document.getElementById("pi-weight").value = data.weight;
      document.getElementById("pi-height").value = data.height;
      document.getElementById("pi-firstName").value = data.first_name;
      document.getElementById("pi-lastName").value = data.last_name;
      // We have no column for activity or target in the DB, so we can't fill them from the DB
    })
    .catch(err => console.error("Error fetching personal info:", err));

  // 2) Hook up the button
  document.querySelector(".button").addEventListener("click", calculateNutrition);

  // 3) Example: show a dynamic text for the slider
  const slider = document.getElementById("pi-activity");
  const activityDesc = document.getElementById("activity-description");
  slider.addEventListener("input", function() {
    // Just an example of textual feedback
    const val = parseInt(slider.value, 10);
    let desc;
    switch (val) {
      case 1: desc = "Sedentary lifestyle"; break;
      case 2: desc = "Light exercise"; break;
      case 3: desc = "Moderate exercise"; break;
      case 4: desc = "Hard exercise regularly"; break;
      case 5: desc = "Athlete level workouts"; break;
      default: desc = "Unknown activity level";
    }
    activityDesc.textContent = desc;
  });
});
