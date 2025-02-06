// profile.js

// Replace with your actual server IP/URL if needed:
const SERVER_IP = "http://51.124.187.58:3000";

const form = document.getElementById('profileForm');
const profileDisplay = document.getElementById('profileDisplay');

// On form submit, prevent default and handle the data
form.addEventListener('submit', async function(event) {
  event.preventDefault();

  // Retrieve userId (assuming it's stored in localStorage)
  const userId = localStorage.getItem('userId');
  if (!userId) {
    alert("No userId found. Please ensure the user is logged in.");
    return;
  }

  // Get form values
  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const age = parseInt(document.getElementById('age').value, 10);
  const height = parseFloat(document.getElementById('height').value);
  const weight = parseFloat(document.getElementById('weight').value);
  const genderValue = document.getElementById('gender').value;

  // Convert "Male"/"Female"/"Other" => numeric sex (1 for male, 0 for female or other)
  let sex = 0; // default
  if (genderValue.toLowerCase() === 'male') {
    sex = 1;
  }

  // 1) Send data to your API to insert into DB
  const payload = {
    userId: Number(userId),
    sex: sex,
    height: height,
    age: age,
    weight: weight,
    firstName: firstName,
    lastName: lastName
  };

  try {
    const response = await fetch(`${SERVER_IP}/api/personal-info/addPI`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (!response.ok || data.error) {
      console.error("Error saving personal info:", data.error || response.statusText);
      alert("Error saving personal info: " + (data.error || response.statusText));
      return;
    }

    // 2) If successful, populate the display section
    document.getElementById('displayFirstName').textContent = firstName;
    document.getElementById('displayLastName').textContent = lastName;
    document.getElementById('displayAge').textContent = age;
    document.getElementById('displayHeight').textContent = height;
    document.getElementById('displayWeight').textContent = weight;
    document.getElementById('displayGender').textContent = genderValue;

    // 3) Show the profile display and hide the form
    form.style.display = 'none';
    profileDisplay.style.display = 'block';

    // Optionally alert or navigate away:
    alert("Personal info saved successfully!");

    // If you want to redirect automatically, uncomment:
    // window.location.href = "index.html";

  } catch (error) {
    console.error("Fetch error:", error);
    alert("An error occurred while saving your info.");
  }
});
