export function isAuthenticated() {
    const user = localStorage.getItem("user");
    const isAuth = localStorage.getItem("isAuth");
    return user && isAuth
}

const userURL = "http://localhost:3000/users"
export async function login(username,password){
    try{
        const url = new URL(userURL)
        url.searchParams.append("username", username)
        url.searchParams.append("password", password)

        const resp = await fetch(url,{ method:"GET" });

        if (!resp.ok){ 
            throw new Error("Error la pagina no responde")
        }
        const users = await  resp.json()
        
        if (users.length === 0){
            alert("Usuario o contraseña invalido")
            return false;
        }
        
        const user = users[0]
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("isAuth", true)
        return true;
    }catch(error){
        console.log(Error)
        alert("Ocurrio un error inesperado")
    }
}