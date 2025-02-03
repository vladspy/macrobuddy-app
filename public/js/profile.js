const form = document.getElementById('profileForm');
const profileDisplay = document.getElementById('profileDisplay');

form.addEventListener('submit', function(event) {
  event.preventDefault();

  // Get form values
  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const age = document.getElementById('age').value;
  const height = document.getElementById('height').value;
  const weight = document.getElementById('weight').value;
  const gender = document.getElementById('gender').value;

  // Populate the display section
  document.getElementById('displayFirstName').textContent = firstName;
  document.getElementById('displayLastName').textContent = lastName;
  document.getElementById('displayAge').textContent = age;
  document.getElementById('displayHeight').textContent = height;
  document.getElementById('displayWeight').textContent = weight;
  document.getElementById('displayGender').textContent = gender;

  // Show the profile display and hide the form
  form.style.display = 'none';
  profileDisplay.style.display = 'block';
});