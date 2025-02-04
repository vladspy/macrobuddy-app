document.addEventListener('DOMContentLoaded', () => {
    // ✅ Check if user is already logged in using session
    fetch('http://51.124.187.58:3000/api/users/isLoggedIn', {
        method: 'GET',
        credentials: 'include' // ✅ Include cookies in the request
    })
    .then(response => response.json())
    .then(data => {
        if (data.loggedIn) {
            window.location.href = "index.html"; // ✅ Redirect to main page
        }
    })
    .catch(error => console.error("Error checking login status:", error));

    // ✅ Handle Logout
    const logoutButton = document.getElementById("logout-btn");
    if (logoutButton) {
        logoutButton.addEventListener("click", async () => {
            await fetch('http://51.124.187.58:3000/api/users/logout', {
                method: 'POST',
                credentials: 'include'
            });
            localStorage.clear();
            window.location.href = "login.html";
        });
    }

    // ✅ Check if User is Already Logged In using LocalStorage
    if (localStorage.getItem("isLoggedIn") === "true") {
        window.location.href = "index.html"; // ✅ Redirect to main page
    }

    // ✅ Handle Sign In
    const signinForm = document.getElementById('signinForm');
    if (signinForm) {
        signinForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent form submission reload

            const email = document.getElementById('signin-email').value;
            const password = document.getElementById('signin-password').value;

            try {
                const response = await fetch('http://51.124.187.58:3000/api/users/verifyUser', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include', // ✅ Ensure cookies are included
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                
                if (response.ok) {
                    localStorage.setItem("isLoggedIn", "true");  // ✅ Store login status
                    localStorage.setItem("authToken", data.token);  // ✅ Store token for API requests
                    localStorage.setItem("email", email);  // ✅ Store email

                    alert("✅ Login successful!");
                    window.location.href = "index.html"; // ✅ Redirect to main page
                } else {
                    alert("❌ Login failed: " + data.error);
                }
            } catch (error) {
                console.error("Error logging in:", error);
                alert("❌ An error occurred.");
            }
        });
    }

    // ✅ Handle Sign Up
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const firstName = document.getElementById('signup-firstname').value;
            const lastName = document.getElementById('signup-lastname').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;

            try {
                const response = await fetch('http://51.124.187.58:3000/api/users/addUser', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ firstName, lastName, email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    alert("✅ Account created successfully! You can now log in.");
                    signupForm.style.display = 'none';
                    signinForm.style.display = 'block';
                } else {
                    alert("❌ Signup failed: " + data.error);
                }
            } catch (error) {
                console.error("Error signing up:", error);
                alert("❌ An error occurred.");
            }
        });
    }
});
