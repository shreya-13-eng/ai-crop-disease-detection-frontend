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

<<<<<<< HEAD
// Login function
async function login(emailOrPhone, password) {
    console.log("Login attempt:", emailOrPhone);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Demo login - accepts any email/phone and any password
    session.login({
        fullName: emailOrPhone.includes('@') ? emailOrPhone.split('@')[0] : emailOrPhone,
        username: emailOrPhone.includes('@') ? emailOrPhone.split('@')[0] : emailOrPhone,
        email: emailOrPhone.includes('@') ? emailOrPhone : null,
        phone: !emailOrPhone.includes('@') ? emailOrPhone : null,
        token: "demo-token-" + Date.now()
    });
    
    return { success: true, message: "Login Successful!" };
=======
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
>>>>>>> 359d38ed8f917e5f28441de6a9bc69dfcdd97ec1
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

        return { success: true, message: "Signup Successful!" };

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
<<<<<<< HEAD
    
    console.log("Updating navigation, user logged in:", !!user);
    
    if (user) {
        if (loginNavBtn) loginNavBtn.classList.add('d-none');
        if (userInfo) userInfo.classList.remove('d-none');
        if (userNameDisplay) userNameDisplay.textContent = user.fullName || user.username;
        
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.onclick = (e) => {
                e.preventDefault();
                logout();
            };
        }
    } else {
        if (loginNavBtn) loginNavBtn.classList.remove('d-none');
        if (userInfo) userInfo.classList.add('d-none');
    }
}

// OTP Timer
let otpTimerInterval = null;

function startOTPTimer() {
    const timerElement = document.getElementById('otpTimer');
    const secondsElement = document.getElementById('timerSeconds');
    const resendBtn = document.getElementById('resendOtpBtn');
    let secondsLeft = 30;
    
    if (otpTimerInterval) clearInterval(otpTimerInterval);
    
    if (timerElement) timerElement.classList.remove('d-none');
    
    otpTimerInterval = setInterval(() => {
        secondsLeft--;
        if (secondsElement) secondsElement.textContent = secondsLeft;
        
        if (secondsLeft <= 0) {
            clearInterval(otpTimerInterval);
            if (timerElement) timerElement.classList.add('d-none');
            if (resendBtn) resendBtn.disabled = false;
        }
    }, 1000);
}

// Loading overlay
=======

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
>>>>>>> 359d38ed8f917e5f28441de6a9bc69dfcdd97ec1
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.remove('d-none');
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.add('d-none');
}
<<<<<<< HEAD

// Update upload button state
function updateUploadButtonState() {
    const user = session.getCurrentSession();
    const uploadBtn = document.getElementById('uploadBtn');
    const cropType = document.getElementById('cropType');
    const growthStage = document.getElementById('growthStage');
    const scanBtn = document.getElementById('scanBtn');
    const loginRequiredMsg = document.getElementById('loginRequiredMsg');
    const uploadArea = document.getElementById('uploadArea');
    
    if (user) {
        if (uploadBtn) uploadBtn.disabled = false;
        if (cropType) cropType.disabled = false;
        if (growthStage) growthStage.disabled = false;
        if (scanBtn) scanBtn.disabled = true;
        if (loginRequiredMsg) loginRequiredMsg.classList.add('d-none');
        if (uploadArea) uploadArea.classList.remove('disabled');
        console.log("✅ Upload enabled - User logged in");
    } else {
        if (uploadBtn) uploadBtn.disabled = true;
        if (cropType) cropType.disabled = true;
        if (growthStage) growthStage.disabled = true;
        if (scanBtn) scanBtn.disabled = true;
        if (loginRequiredMsg) loginRequiredMsg.classList.remove('d-none');
        if (uploadArea) uploadArea.classList.add('disabled');
        console.log("❌ Upload disabled - User not logged in");
    }
}

// Make functions global
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.updateUploadButtonState = updateUploadButtonState;
window.startOTPTimer = startOTPTimer;
window.logout = logout;

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log("Auth.js initialized");
    
=======
window.addEventListener("authChanged", () => {
>>>>>>> 359d38ed8f917e5f28441de6a9bc69dfcdd97ec1
    updateNavigation();
});
// ================= INIT =================
document.addEventListener('DOMContentLoaded', function() {

    updateNavigation();

    // ================= LOGIN =================
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
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

    // ================= SIGNUP =================
    const signupForm = document.getElementById('signupForm');

    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const name = document.getElementById('signupName').value.trim();
            const email = document.getElementById('signupEmail').value.trim();
            const phone = document.getElementById('signupPhone').value.trim();
            const password = document.getElementById('signupPassword').value;
            const confirm = document.getElementById('confirmPassword').value;
            const submitBtn = document.getElementById('signupSubmitBtn');

            if (!name || !email || !phone || !password || !confirm) {
                showAlert("Please fill all fields", "danger", "signupAlert");
                return;
            }

            if (password !== confirm) {
                showAlert("Passwords do not match", "danger", "signupAlert");
                return;
            }

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creating Account...';
            showLoading();

            const result = await signup({ name, email, phone, password });

            hideLoading();
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Create Account';

            if (result.success) {
                showAlert(result.message, "success", "signupAlert");

                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                showAlert(result.message, "danger", "signupAlert");
            }
        });
    }
<<<<<<< HEAD
    
    // ========== FORGOT PASSWORD ==========
    const forgotForm = document.getElementById('forgotPasswordForm');
    if (forgotForm) {
        forgotForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('resetEmail').value;
            if (email) {
                showAlert("Reset instructions sent! Check your email.", "success", "forgotAlert");
                this.reset();
                setTimeout(() => {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('forgotPasswordModal'));
                    if (modal) modal.hide();
                }, 3000);
            } else {
                showAlert("Please enter your email or phone number", "danger", "forgotAlert");
            }
        });
    }
});
=======

});

window.updateNavigation = updateNavigation;
>>>>>>> 359d38ed8f917e5f28441de6a9bc69dfcdd97ec1
