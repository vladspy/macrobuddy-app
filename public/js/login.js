document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ login.js loaded successfully!");

    const signinForm = document.getElementById('signinForm');

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

            const response = await fetch('http://51.124.187.58:3000/api/users/verifyUser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password }) // ✅ Make sure data is sent correctly
            });

            const data = await response.json();
            
            if (response.ok) {
                console.log("✅ Login successful!");

                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("authToken", data.token);
                localStorage.setItem("email", email);

                alert("✅ Login successful!");
                window.location.href = "index.html";
            } else {
                console.error("❌ Login failed:", data.error);
                alert("❌ Login failed: " + data.error);
            }
        } catch (error) {
            console.error("❌ Error logging in:", error);
            alert("❌ An error occurred.");
        }
    });
});

    

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
            const response = await fetch('/api/users/verifyUser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert("✅ Login successful!");
                window.location.href = "index.html"; // ✅ Redirect to main page
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
            const response = await fetch('/api/users/addUser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
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
            console.error("❌ Error signing up:", error);
            alert("❌ An error occurred.");
        }
    });