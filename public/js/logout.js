document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ logout.js loaded successfully!");

    const logoutButton = document.getElementById("logout-btn");

    if (logoutButton) {
        logoutButton.addEventListener("click", async () => {
            try {
                console.log("🔍 Logging out...");

                // Send logout request to backend
                await fetch("/api/users/logout", {
                    method: "POST",
                    credentials: "include",
                });

                // Clear local storage
                localStorage.removeItem("isLoggedIn");
                localStorage.removeItem("authToken");
                localStorage.removeItem("email");

                alert("✅ Logged out successfully!");

                // Redirect to login page
                window.location.href = "login.html";
            } catch (error) {
                console.error("❌ Error logging out:", error);
                alert("❌ Logout failed.");
            }
        });
    }
});
