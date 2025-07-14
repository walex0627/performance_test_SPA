import { login, register, isAuthenticated } from "./controllers/auth.services";
import { setupCrudEvents, setupUserEventsView } from "./controllers/events.services";

const routes = {
    "/": "./src/views/home.html",
    "/login": "./src/views/login.html",
    "/404": "./src/views/404.html",
    "/register": "./src/views/register.html",
    "/events": "./src/views/events.html",
    "/crud": "./src/views/crudEvents.html"
}

export async function renderRoute() {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const path = location.hash.replace("#", "") || "/";
    const app = document.getElementById("app");
    const isAuth = localStorage.getItem("isAuth") === "true";
    const file = routes[path];

    if (!file) {
        location.hash = "/404";
        return;
    }

    // Redirect authenticated users from login page to home
    if (isAuth && path === "/login") {
        location.hash = "/";
        return;
    }

    // Protect routes: Redirect unauthenticated users from protected routes to login
    if (!isAuth && path !== "/login" && path !== "/register") {
        location.hash = "/login";
        return;
    }

    try {
        const res = await fetch(file);
        const html = await res.text();

        app.innerHTML = html;

        // Specific logic for the login page
        if (path === "/login") {
            document.getElementById("navbar").hidden = true; 
            const loginError = document.getElementById("loginError");
            document.getElementById("loginForm").addEventListener("submit", async (e) => {
                e.preventDefault();

                const username = document.getElementById("username").value.trim();
                const password = document.getElementById("password").value.trim();
                if (username === "" || password === "") {
                    loginError.style.display = "block";
                    return;
                }
                const userLogged = await login(username, password);
                console.log(`Current path after login attempt: ${path}`); 

                if (userLogged) {
                    loginError.style.display = "none";
                    document.getElementById("navbar").hidden = false; 
                    location.hash = "/"; 
                } else {
                    loginError.style.display = "block"; 
                }
            });
            document.getElementById("sign-up").addEventListener("click", () => {
                location.hash = "/register"; 
            });
        }

        // Specific logic for the register page
        if (path === "/register") {
            document.getElementById("navbar").hidden = true; 
        }

        // Logout button logic (common for authenticated pages)
        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
            if (isAuth) {
                logoutBtn.style.display = "block"; 
            } else {
                logoutBtn.style.display = "none"; 
            }

            logoutBtn.addEventListener("click", () => {
                localStorage.removeItem("user");
                localStorage.removeItem("isAuth");
                location.hash = "/login"; 
            });
        }

        // Specific logic for the home page ("/")
        if (path === "/") {
            if (user && user.role === "admin") {
                app.innerHTML = `
                <div class="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen flex flex-col justify-center items-center">
                    <h2 class="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-8">Welcome back, ${user.username}!</h2>
                    <div class="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                        <button id="createEventsBtn" class="bg-blue-600 text-white p-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out text-lg shadow-md cursor-pointer">
                            Manage Events
                        </button>
                        <button id="eventsBtn" class="bg-purple-600 text-white p-4 rounded-lg font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-200 ease-in-out text-lg shadow-md cursor-pointer">
                            View All Events
                        </button>
                    </div>
                </div>
                `;
                document.getElementById("createEventsBtn")?.addEventListener("click", () => {
                    location.hash = "/crud"; 
                });
                document.getElementById("eventsBtn")?.addEventListener("click", () => {
                    location.hash = "/events"; 
                });

            } else if (user && user.role === "user") {

                app.innerHTML = `
                <div class="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen flex flex-col justify-center items-center">
                    <h2 class="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-8">Hello ${user.username}!</h2>
                    <div class="flex justify-center">
                        <button id="eventsBtn" class="bg-green-600 text-white p-4 rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 ease-in-out text-lg shadow-md cursor-pointer">
                            View Events
                        </button>
                    </div>
                </div>
                `;
                document.getElementById("eventsBtn")?.addEventListener("click", () => {
                    location.hash = "/events"; 
                });
            } else {
                console.warn("User not authenticated or role not recognized on the home route.");

                location.hash = "/login";
            }
        }
       
        if (path === "/crud") {
            if (!user || user.role !== "admin") {
                alert("Access Denied: You must be an administrator to view this page.");
                location.hash = "/"; 
                return;
            }
            await setupCrudEvents(); // Initialize CRUD functionality
        }

        // Specific logic for the events (user view) page
        if (path === "/events") {
            

            const storedUser = localStorage.getItem("user");
            const currentUser = storedUser ? JSON.parse(storedUser) : null;
            const isAuth = !!currentUser; 

            if (!isAuth) {
                alert("You must be logged in to view events."); 
                window.location.hash = "/login"; 
                return;
            }

            try {
                const response = await fetch(routes[path]);
                if (!response.ok) {
                    throw new Error(`Error loading events HTML: ${response.status}`); 
                }
                const html = await response.text();
                document.getElementById("app").innerHTML = html;

                await setupUserEventsView(); 

            } catch (error) {
                console.error("Error loading events view:", error); 
                document.getElementById("app").innerHTML = "<h1 class='text-red-600 text-center text-xl'>Error loading the events page.</h1>"; 
            }
        }
    } catch (error) {
        console.error("Error loading view:", error); 
        app.innerHTML = "<h1 class='text-red-600 text-center text-xl'>Could not load view. An error occurred.</h1>"; 
    }
}