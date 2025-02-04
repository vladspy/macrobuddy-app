document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ login.js loaded successfully!");

    const signinForm = document.getElementById('signinForm');
    const signupForm = document.getElementById('signupForm');
    const logoutButton = document.getElementById("logout-btn");

    if (!signinForm || !signupForm) {
        console.error("❌ Form elements not found. Ensure IDs are correct in login.html.");
        return;
    }

    // ✅ Check if user is already logged in using session
    fetch('http://51.124.187.58:3000/api/users/isLoggedIn', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.loggedIn) {
            window.location.href = "index.html"; // ✅ Redirect to main page
        }
    }).catch(err => console.error("❌ Error checking login status:", err));


    function logout() {
        fetch('http://51.124.187.58:3000/api/users/logout', {
            method: 'POST',
            credentials: 'include' // ✅ Makes sure cookies are included in the request
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                localStorage.clear(); // ✅ Clear user data
                document.cookie = "sessionID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                alert("✅ Logged out successfully!");
                window.location.href = "login.html"; // ✅ Redirect to login page
            } else {
                alert("❌ Logout failed: " + data.error);
            }
        })
        .catch(error => {
            console.error("❌ Error logging out:", error);
            alert("❌ Logout failed.");
        });
    }
    
    // Attach logout event listener
    document.getElementById("logout-btn").addEventListener("click", logout);
    // ✅ Handle Sign In
    signinForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent form submission reload

        const email = document.getElementById('signin-email')?.value;
        const password = document.getElementById('signin-password')?.value;

        if (!email || !password) {
            alert("❌ Please fill out all fields.");
            return;
        }

        try {
            const response = await fetch('http://51.124.187.58:3000/api/users/verifyUser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("authToken", data.token);
                localStorage.setItem("email", email);

                alert("✅ Login successful!");
                window.location.href = "index.html";
            } else {
                alert("❌ Login failed: " + data.error);
            }
        } catch (error) {
            console.error("❌ Error logging in:", error);
            alert("❌ An error occurred.");
        }
    });

    // ✅ Handle Sign Up
    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const firstName = document.getElementById('signup-firstname')?.value;
        const lastName = document.getElementById('signup-lastname')?.value;
        const email = document.getElementById('signup-email')?.value;
        const password = document.getElementById('signup-password')?.value;

        if (!firstName || !lastName || !email || !password) {
            alert("❌ Please fill out all fields.");
            return;
        }

        try {
            const response = await fetch('http://51.124.187.58:3000/api/users/addUser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert("✅ Account created successfully! You can now log in.");
                signinForm.style.display = 'block';
                signupForm.style.display = 'none';
            } else {
                alert("❌ Signup failed: " + data.error);
            }
        } catch (error) {
            console.error("❌ Error signing up:", error);
            alert("❌ An error occurred.");
        }
    });
});
