document.addEventListener("DOMContentLoaded", () =>{

const registerForm = document.getElementById("register-form")
const loginForm = document.getElementById("login-form")

async function handleLogin() {
    const email = document.getElementById('login-email').value
    const pw = document.getElementById('login-password').value
    const user = {
        email: email,
        password: pw
    }
    console.log(user)
    const url = "/api/auth";
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user)
    });
    const data = await response.json();
    if (!response.ok){
        alert(data.error || "Login failed!");
        return;
    }
    console.log(user, "logged in sucessfully.")
    window.location.href = "/projects";
}

async function handleRegister(){
    const registerForm = document.getElementById('register-form');
    const pw = document.getElementById('register-password').value;
    const confirm_pw = document.getElementById('confirm-register-password').value;
    if (pw !== confirm_pw) {
        const oldMessage = document.getElementById('mismatch-msg');
        if (oldMessage) {
            oldMessage.remove();
        }
        const mismatch = document.createElement("p")
        mismatch.innerText = "Passwords do not match."
        mismatch.id = "mismatch-msg";
        mismatch.style.color = "red";
        registerForm.appendChild(mismatch)
        return;
    }
    const email = document.getElementById('register-email').value;
    const username = document.getElementById('register-username').value;
    const user = {
        username: username,
        email: email,
        password: pw
    }
    const url = "/api/register";
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user)
    });
    const data = await response.json();
    if (!response.ok) {
        alert("Account creation failed!");
        console.log("Account creation failed.")
        return;
    }
    alert("Account creation successful!");
    window.location.href = `/${data.username}/profile`;
};



if(registerForm){
    registerForm.addEventListener("submit", function (event) {
        event.preventDefault();
        handleRegister();
    })
};


if(loginForm){
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();
        handleLogin();
    });
}

});