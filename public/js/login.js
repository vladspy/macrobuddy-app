document.addEventListener('DOMContentLoaded', () => {
    console.log("✅ login.js loaded successfully!");
  
    const signinForm = document.getElementById('signinForm');
    const signupForm = document.getElementById('signupForm');
  
    if (!signinForm || !signupForm) {
      console.error("❌ Form elements not found. Ensure IDs are correct in login.html.");
      return;
    }
  
    // ✅ Check if User is Already Logged In
    fetch('http://51.124.187.58:3000/api/users/isLoggedIn', {
      method: 'GET',
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        if (data.loggedIn && data.userId) {
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("userId", data.userId);
          console.log("✅ User is already logged in:", data.userId);
          window.location.href = "/public/profile.html"; // Redirect if logged in
        }
      });
  
    // ✅ Handle Logout
    document.getElementById("logout-btn")?.addEventListener("click", async () => {
      await fetch('http://51.124.187.58:3000/api/users/logout', {
        method: 'POST',
        credentials: 'include'
      });
      localStorage.clear();
      window.location.href = "login.html";
    });
  
    // ✅ Handle Sign In
    signinForm.addEventListener('submit', async (event) => {
      event.preventDefault(); // Prevent form submission reload
  
      const email = document.getElementById('signin-email').value;
      const password = document.getElementById('signin-password').value;
  
      if (!email || !password) {
        alert("❌ Please fill out all fields.");
        return;
      }
  
      try {
        console.log("🔍 Sending login request...");
        const response = await fetch('/api/users/verifyUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password })
        });
  
        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          console.error("❌ Failed to parse JSON:", parseError);
          alert("❌ An error occurred while processing the login response.");
          return;
        }
  
        if (response.ok && data.userId) {
          console.log("✅ Login successful!");
          // ✅ Store userId properly
          localStorage.setItem("userId", data.userId.toString());
          console.log("Stored userId:", data.userId);
  
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("email", email);
  
          alert("✅ Login successful!");
          window.location.href = "/public/profile.html"; // Redirect to profile
        } else {
          console.error("❌ Login failed:", data.error || "An unknown error occurred.");
          alert("❌ Login failed: " + (data.error || "An unknown error occurred."));
        }
      } catch (error) {
        console.error("❌ Error logging in:", error);
        alert("❌ An error occurred.");
      }
    });
  
    // ✅ Handle Sign Up
    signupForm.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      const firstName = document.getElementById('signup-firstname').value;
      const lastName = document.getElementById('signup-lastname').value;
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
  
      if (!firstName || !lastName || !email || !password) {
        alert("❌ Please fill out all fields.");
        return;
      }
  
      try {
        console.log("🔍 Sending signup request...");
        const response = await fetch('/api/users/addUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ firstName, lastName, email, password })
        });
  
        const data = await response.json();
  
        if (response.ok && data.userId) {
          alert("✅ Account created successfully!");
          // ✅ Store userId in localStorage
          localStorage.setItem("userId", data.userId.toString());
          console.log("Stored userId after signup:", data.userId);
  
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("email", email);
  
          window.location.href = "/public/profile.html"; // Redirect to profile
        } else {
          alert("❌ Signup failed: " + (data.error || "An unknown error occurred."));
        }
      } catch (error) {
        console.error("❌ Error signing up:", error);
        alert("❌ An error occurred.");
      }
    });
  });
  