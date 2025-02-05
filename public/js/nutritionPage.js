/* script.js */
function calculateNutrition() {
  alert("Nutrition targets calculated!");
}

document.addEventListener("DOMContentLoaded", function() {
  document.querySelector(".button").addEventListener("click", calculateNutrition);
});