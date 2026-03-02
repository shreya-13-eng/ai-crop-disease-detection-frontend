import SessionManager from "./SessionManager.js";

const session = SessionManager.getInstance();

function showAlert(message, type, containerId) {
    const alertContainer = document.getElementById(containerId);
    const alertDiv = document.createElement('div');

    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
        <span>${message}</span>
    `;

    alertContainer.innerHTML = '';
    alertContainer.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 4000);
}


function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^\d{10}$/;
    return re.test(phone);
}

function login(emailOrPhone, password) {

    return fetch("http://localhost:8080/api/public/auth/login", {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            username: emailOrPhone,
            password: password
        })
    })
    .then(async (response) => {

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Login failed");
        }

        return data;
    })
    .then(data => {
        session.login({
            fullName: data.fullName,
            username: data.userName,
            token: data.token
        });

        return { success: true, message: "Login Successful" };
    })
    .catch(error => {
        return { success: false, message: error.message };
    });
}

function signup(userData) {

    return fetch("http://localhost:8080/api/public/sign-up", {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            fullName: userData.name,
            password: userData.password,
            email: userData.email,
            phoneNumber: "91" + userData.phone
        })
    })
    .then(async (response) => {

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Signup failed");
        }

        return data;
    })
    .then(data => {

        session.login({
            fullName: data.fullName,
            username: data.userName,
            token: data.token
        });

        return { success: true, message: "Signup Successful" };
    })
    .catch(error => {
        return { success: false, message: error.message };
    });
}


function logout() {
    session.logout();
    window.location.href = "index.html";
}


function updateNavigation() {

    const user = session.getCurrentSession();
    const loginBtn = document.querySelector('[data-bs-target="#loginModal"]');

    if (user && loginBtn) {
        loginBtn.innerHTML = `
            <i class="bi bi-person-circle me-1"></i> 
            ${user.fullName}
        `;
    }
}


document.addEventListener('DOMContentLoaded', function () {

    updateNavigation();

    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const emailOrPhone = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;

            if (!emailOrPhone || !password) {
                showAlert("Please fill all fields", "danger", "loginAlert");
                return;
            }

            const result = await login(emailOrPhone, password);

            if (result.success) {

                showAlert(result.message, "success", "loginAlert");

                setTimeout(() => {
                    window.location.href = "index.html"; 
                }, 1000);

            } else {
                showAlert(result.message, "danger", "loginAlert");
            }
        });
    }


    const signupForm = document.getElementById('signupForm');

    if (signupForm) {
        signupForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const name = document.getElementById('signupName').value.trim();
            const email = document.getElementById('signupEmail').value.trim();
            const phone = document.getElementById('signupPhone').value.trim();
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (!name || !email || !phone || !password || !confirmPassword) {
                showAlert("Please fill all fields", "danger", "signupAlert");
                return;
            }

            if (!validateEmail(email)) {
                showAlert("Invalid email format", "danger", "signupAlert");
                return;
            }

            if (!validatePhone(phone)) {
                showAlert("Invalid phone number", "danger", "signupAlert");
                return;
            }

            if (password !== confirmPassword) {
                showAlert("Passwords do not match", "danger", "signupAlert");
                return;
            }

            const result = await signup({
                name,
                email,
                phone,
                password
            });

            if (result.success) {

                showAlert(result.message, "success", "signupAlert");

                setTimeout(() => {
                    window.location.href = "index.html"; 
                }, 1000);

            } else {
                showAlert(result.message, "danger", "signupAlert");
            }
        });
    }

});