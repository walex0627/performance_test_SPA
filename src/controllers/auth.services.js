export function isAuthenticated() {
    const user = localStorage.getItem("user");
    const isAuth = localStorage.getItem("isAuth");
    return user && isAuth;
}

const userURL = "http://localhost:3000/users";

export async function login(username, password) {
    try {
        const url = new URL(userURL);
        url.searchParams.append("username", username);
        url.searchParams.append("password", password);

        const resp = await fetch(url, { method: "GET" });

        if (!resp.ok) {
            throw new Error("Error: The page is not responding");
        }
        const users = await resp.json();

        if (users.length === 0) {
            alert("Invalid username or password");
            return false;
        }

        const user = users[0];
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("isAuth", true);
        return true;
    } catch (error) {
        console.log(error); 
        alert("An unexpected error occurred");
    }
}

export async function register() { 
    document.getElementById("navbar").hidden = true;
    const form = document.getElementById("registerForm");
    const cancelButton = document.getElementById("cancelRegisterBtn"); 

    if (!form) {
        console.error("The registration form was not found");
        return;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = form.name.value.trim();
        const lastname = form.lastname.value.trim(); 
        const username = form.username.value.trim();
        const password = form.password.value.trim();

        // Validación básica
        if (!name || !lastname || !username || !password) {
            alert("Por favor, rellena todos los campos.");
            return;
        }

        try {
            const params = new URLSearchParams({
                username: username
            });
            const userCheckUrl = `${userURL}?${params.toString()}`; 
            const res = await fetch(userCheckUrl);
            const userExist = await res.json();

            if (userExist.length > 0) {
                alert(`${username} already exists, please try another one`);
                return;
            }

            const newUser = {
                name: name,
                lastname: lastname,
                username: username,
                password: password,
                role: "user",
            };

            const post = await fetch(userURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newUser)
            });

            if (!post.ok) {
                throw new new Error('Error creating user: ' + await post.text()); // Más detalles del error
            }
            alert(`${username} was created successfully.`);
            form.reset();
            location.hash = "/login"; 
        } catch (error) {
            console.error('Error during registration:', error);
            alert('Error registering the user');
        }
    });

    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            console.log("Cancel button clicked, redirecting to /login");
            location.hash = "/login"; 
        });
    } else {
        console.warn("Cancel button not found.");
    }
}