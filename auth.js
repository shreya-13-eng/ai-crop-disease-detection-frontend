import SessionManager from "./sessionManager.js";

const session = SessionManager.getInstance();


// ================= ALERT =================
function showAlert(message, type, containerId) {
    const alertContainer = document.getElementById(containerId);
    if (!alertContainer) return;

    alertContainer.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : type === 'danger' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;

    setTimeout(() => {
        if (alertContainer.firstChild) {
            alertContainer.firstChild.remove();
        }
    }, 4000);
}

// ================= VALIDATION =================
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    return /^\d{10}$/.test(phone);
}

// ================= LOGIN API =================
async function login(emailOrPhone, password) {
    try {
        const response = await fetch("http://localhost:8080/api/public/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: emailOrPhone,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Login failed");
        }

        session.login({
            fullName: data.fullName,
            username: data.userName,
            token: data.token
        });

        return { success: true, message: "Login Successful!" };

    } catch (error) {
        return { success: false, message: error.message };
    }
}

// ================= SIGNUP API =================
async function signup(userData) {
    try {
        const response = await fetch("http://localhost:8080/api/public/sign-up", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fullName: userData.name,
                email: userData.email,
                password: userData.password,
                phoneNumber: "91" + userData.phone
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Signup failed");
        }

        session.login({
            fullName: data.fullName,
            username: data.userName,
            token: data.token
        });

        return { success: true, message: "Verification OTP sent to mail!" };

    } catch (error) {
        return { success: false, message: error.message };
    }
}

// ================= OTP (DEMO - OPTIONAL) =================
async function requestOTP(phoneNumber) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: "OTP sent! Demo OTP: 123456" };
}

async function verifyOTP(phoneNumber, otpCode) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (otpCode === "123456") {
        session.login({
            fullName: `Farmer ${phoneNumber.slice(-4)}`,
            username: `farmer_${phoneNumber.slice(-4)}`,
            phone: phoneNumber,
            token: "demo-token"
        });
        return { success: true };
    }
    return { success: false, message: "Invalid OTP" };
}

// ================= LOGOUT =================
function logout() {
    session.logout();
    window.location.href = "index.html";
}
function updateNavigation() {
    const user = session.getCurrentSession();

    const loginNavBtn = document.getElementById('loginNavBtn');
    const userInfo = document.getElementById('userInfo');
    const userNameDisplay = document.getElementById('userNameDisplay');

    if (user) {

        if (loginNavBtn) loginNavBtn.style.display = 'none';
        if (userInfo) userInfo.style.display = 'flex';
        if (userNameDisplay) userNameDisplay.textContent = user.fullName;

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) logoutBtn.onclick = logout;

    } else {
        if (loginNavBtn) loginNavBtn.style.display = 'block';
        if (userInfo) userInfo.style.display = 'none';
        if (userNameDisplay) userNameDisplay.textContent = "";
    }
}

// ================= LOADING =================
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.remove('d-none');
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.add('d-none');
}
window.addEventListener("authChanged", () => {
    updateNavigation();
});

// ================= INIT =================
document.addEventListener('DOMContentLoaded', function () {
    updateNavigation();
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const emailOrPhone = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            const submitBtn = document.getElementById('loginSubmitBtn');

            if (!emailOrPhone || !password) {
                showAlert("Please fill all fields", "danger", "loginAlert");
                return;
            }

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Logging in...';
            showLoading();

            const result = await login(emailOrPhone, password);

            hideLoading();
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Login';

            if (result.success) {
                showAlert(result.message, "success", "loginAlert");

                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                showAlert(result.message, "danger", "loginAlert");
            }
        });
    }
});



window.updateNavigation = updateNavigation;
