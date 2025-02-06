document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ login.js loaded successfully!");

    const signinForm = document.getElementById("signinForm");
    const signupForm = document.getElementById("signupForm");

    if (!signinForm || !signupForm) {
        console.error("❌ Form elements not found. Ensure IDs are correct in login.html.");
        return;
    }

    // ✅ Handle Sign In
    signinForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("signin-email").value;
        const password = document.getElementById("signin-password").value;

        if (!email || !password) {
            alert("❌ Please fill out all fields.");
            return;
        }

        try {
            console.log("🔍 Sending login request...");

            const response = await fetch("/api/users/verifyUser", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                console.log("✅ Login successful!");
                
                // ✅ Store session details
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("authToken", data.token);
                localStorage.setItem("email", email);
                localStorage.setItem("userId", data.userId); // ✅ Store user ID

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

    // ✅ Handle Sign Up
    signupForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = document.getElementById("signup-username").value;
        const email = document.getElementById("signup-email").value;
        const password = document.getElementById("signup-password").value;

        if (!username || !email || !password) {
            alert("❌ Please fill out all fields.");
            return;
        }

        try {
            console.log("🔍 Sending signup request...");

            const response = await fetch("/api/users/addUser", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("✅ Account created successfully!");

                // ✅ Store session details
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("email", email);
                localStorage.setItem("username", username);
                localStorage.setItem("userId", data.userId); // ✅ Store user ID

                // ✅ Redirect to Profile Page instead of Index
                window.location.href = "profile.html";
            } else {
                alert("❌ Signup failed: " + data.error);
            }
        } catch (error) {
            console.error("❌ Error signing up:", error);
            alert("❌ An error occurred.");
        }
    });
});
