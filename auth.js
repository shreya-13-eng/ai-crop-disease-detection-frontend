import SessionManager from "./sessionManager.js";

const session = SessionManager.getInstance();

// Show alert messages
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

// Validate functions
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    return /^\d{10}$/.test(phone);
}

// Login function - Demo mode always works
async function login(emailOrPhone, password) {
    console.log("Login attempt:", emailOrPhone);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Always succeed in demo mode
    session.login({
        fullName: emailOrPhone.includes('@') ? emailOrPhone.split('@')[0] : emailOrPhone,
        username: emailOrPhone.includes('@') ? emailOrPhone.split('@')[0] : emailOrPhone,
        email: emailOrPhone.includes('@') ? emailOrPhone : null,
        phone: !emailOrPhone.includes('@') ? emailOrPhone : null,
        token: "demo-token-" + Date.now()
    });
    
    return { success: true, message: "Login Successful!" };
}

// Request OTP function
async function requestOTP(phoneNumber) {
    console.log("Requesting OTP for:", phoneNumber);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: "OTP sent! Demo OTP: 123456", isDemo: true };
}

// Verify OTP function
async function verifyOTP(phoneNumber, otpCode) {
    console.log("Verifying OTP:", otpCode);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (otpCode === "123456") {
        session.login({
            fullName: `Farmer ${phoneNumber.slice(-4)}`,
            username: `farmer_${phoneNumber.slice(-4)}`,
            phone: phoneNumber,
            token: "demo-token-" + Date.now()
        });
        return { success: true, message: "Login Successful!" };
    }
    
    return { success: false, message: "Invalid OTP. Demo OTP is 123456" };
}

// Signup function
async function signup(userData) {
    console.log("Signup:", userData.email);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    session.login({
        fullName: userData.name,
        username: userData.email.split('@')[0],
        email: userData.email,
        phone: userData.phone,
        token: "demo-token-" + Date.now()
    });
    
    return { success: true, message: "Signup Successful!" };
}

function logout() {
    session.logout();
    window.location.href = "index.html";
}

function updateNavigation() {
    const user = session.getCurrentSession();
    const loginNavBtn = document.getElementById('loginNavBtn');
    const userInfo = document.getElementById('userInfo');
    const userNameDisplay = document.getElementById('userNameDisplay');
    
    if (user && loginNavBtn) {
        if (loginNavBtn) loginNavBtn.style.display = 'none';
        if (userInfo) userInfo.style.display = 'flex';
        if (userNameDisplay) userNameDisplay.textContent = user.fullName || user.username;
        
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.onclick = () => logout();
        }
    } else if (loginNavBtn) {
        if (loginNavBtn) loginNavBtn.style.display = 'inline-block';
        if (userInfo) userInfo.style.display = 'none';
    }
}

// Password visibility toggle
window.togglePasswordVisibility = function(inputId, element) {
    const passwordInput = document.getElementById(inputId);
    const icon = element.querySelector('i');
    
    if (passwordInput) {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('bi-eye');
            icon.classList.add('bi-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('bi-eye-slash');
            icon.classList.add('bi-eye');
        }
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
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.remove('d-none');
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.add('d-none');
}

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
        if (loginRequiredMsg) loginRequiredMsg.style.display = 'none';
        if (uploadArea) uploadArea.classList.remove('disabled');
        console.log("✅ Upload enabled - User logged in");
    } else {
        if (uploadBtn) uploadBtn.disabled = true;
        if (cropType) cropType.disabled = true;
        if (growthStage) growthStage.disabled = true;
        if (scanBtn) scanBtn.disabled = true;
        if (loginRequiredMsg) loginRequiredMsg.style.display = 'block';
        if (uploadArea) uploadArea.classList.add('disabled');
        console.log("❌ Upload disabled - User not logged in");
    }
}

// Make functions global
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.updateUploadButtonState = updateUploadButtonState;
window.startOTPTimer = startOTPTimer;

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log("Auth.js initialized");
    
    updateNavigation();
    updateUploadButtonState();
    
    // Phone number validation
    const signupPhone = document.getElementById('signupPhone');
    if (signupPhone) {
        signupPhone.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '').slice(0, 10);
        });
    }
    
    const otpPhone = document.getElementById('otpPhoneNumber');
    if (otpPhone) {
        otpPhone.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '').slice(0, 10);
        });
    }
    
    // Password strength indicator
    const signupPassword = document.getElementById('signupPassword');
    const strengthBar = document.getElementById('passwordStrengthBar');
    const strengthText = document.getElementById('strengthText');
    
    if (signupPassword && strengthBar) {
        signupPassword.addEventListener('input', function() {
            const password = this.value;
            let strength = 0;
            if (password.length >= 8) strength += 25;
            if (password.match(/[a-z]/)) strength += 25;
            if (password.match(/[A-Z]/)) strength += 25;
            if (password.match(/[0-9]/) || password.match(/[^a-zA-Z0-9]/)) strength += 25;
            
            strengthBar.style.width = strength + '%';
            
            if (strength <= 25) {
                strengthBar.className = 'progress-bar bg-danger';
                if (strengthText) strengthText.textContent = 'Weak password';
            } else if (strength <= 50) {
                strengthBar.className = 'progress-bar bg-warning';
                if (strengthText) strengthText.textContent = 'Fair password';
            } else if (strength <= 75) {
                strengthBar.className = 'progress-bar bg-info';
                if (strengthText) strengthText.textContent = 'Good password';
            } else {
                strengthBar.className = 'progress-bar bg-success';
                if (strengthText) strengthText.textContent = 'Strong password';
            }
        });
    }
    
    // Confirm password validation
    const confirmPassword = document.getElementById('confirmPassword');
    if (confirmPassword && signupPassword) {
        confirmPassword.addEventListener('input', function() {
            if (this.value !== signupPassword.value) {
                this.setCustomValidity('Passwords do not match');
            } else {
                this.setCustomValidity('');
            }
        });
    }
    
    // ========== LOGIN FORM ==========
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
                updateUploadButtonState();
                updateNavigation();
                
                setTimeout(() => {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                    if (modal) modal.hide();
                    window.location.reload();
                }, 1000);
            } else {
                showAlert(result.message, "danger", "loginAlert");
            }
        });
    }
    
    // ========== OTP REQUEST ==========
    const otpLoginRequestForm = document.getElementById('otpLoginRequestForm');
    if (otpLoginRequestForm) {
        otpLoginRequestForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const phoneNumber = document.getElementById('otpPhoneNumber').value.trim();
            const requestBtn = document.getElementById('requestOtpBtn');
            
            if (!phoneNumber || !validatePhone(phoneNumber)) {
                showAlert("Please enter a valid 10-digit phone number", "danger", "loginAlert");
                return;
            }
            
            requestBtn.disabled = true;
            requestBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';
            showLoading();
            
            const result = await requestOTP(phoneNumber);
            
            hideLoading();
            requestBtn.disabled = false;
            requestBtn.innerHTML = 'Send OTP';
            
            if (result.success) {
                showAlert("OTP sent! Demo OTP: 123456", "success", "loginAlert");
                
                const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                if (loginModal) loginModal.hide();
                
                window.pendingOTPPhone = phoneNumber;
                
                setTimeout(() => {
                    const otpModal = new bootstrap.Modal(document.getElementById('otpModal'));
                    otpModal.show();
                    startOTPTimer();
                }, 500);
            } else {
                showAlert(result.message, "danger", "loginAlert");
            }
        });
    }
    
    // ========== OTP VERIFICATION ==========
    const otpForm = document.getElementById('otpForm');
    if (otpForm) {
        otpForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const otpCode = document.getElementById('otpCode').value.trim();
            const verifyBtn = document.getElementById('verifyOtpBtn');
            
            if (!otpCode || otpCode.length !== 6) {
                showAlert("Please enter a valid 6-digit OTP", "danger", "otpAlert");
                return;
            }
            
            verifyBtn.disabled = true;
            verifyBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Verifying...';
            showLoading();
            
            const result = await verifyOTP(window.pendingOTPPhone, otpCode);
            
            hideLoading();
            verifyBtn.disabled = false;
            verifyBtn.innerHTML = 'Verify & Login';
            
            if (result.success) {
                showAlert(result.message, "success", "otpAlert");
                updateUploadButtonState();
                updateNavigation();
                
                setTimeout(() => {
                    const otpModal = bootstrap.Modal.getInstance(document.getElementById('otpModal'));
                    if (otpModal) otpModal.hide();
                    window.location.reload();
                }, 1000);
            } else {
                showAlert(result.message, "danger", "otpAlert");
            }
        });
    }
    
    // ========== RESEND OTP ==========
    const resendOtpBtn = document.getElementById('resendOtpBtn');
    if (resendOtpBtn) {
        resendOtpBtn.addEventListener('click', async function() {
            if (!window.pendingOTPPhone) {
                showAlert("Please request OTP again", "danger", "otpAlert");
                return;
            }
            
            resendOtpBtn.disabled = true;
            showLoading();
            
            const result = await requestOTP(window.pendingOTPPhone);
            
            hideLoading();
            
            if (result.success) {
                showAlert("Demo OTP sent! Use code: 123456", "success", "otpAlert");
                startOTPTimer();
            } else {
                showAlert(result.message, "danger", "otpAlert");
                resendOtpBtn.disabled = false;
            }
        });
    }
    
    // ========== SIGNUP FORM ==========
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('signupName').value.trim();
            const email = document.getElementById('signupEmail').value.trim();
            const phone = document.getElementById('signupPhone').value.trim();
            const password = document.getElementById('signupPassword').value;
            const confirm = document.getElementById('confirmPassword').value;
            const terms = document.getElementById('termsAgree');
            const submitBtn = document.getElementById('signupSubmitBtn');
            
            if (!name || !email || !phone || !password || !confirm) {
                showAlert("Please fill all fields", "danger", "signupAlert");
                return;
            }
            
            if (!validateEmail(email)) {
                showAlert("Invalid email format", "danger", "signupAlert");
                return;
            }
            
            if (!validatePhone(phone)) {
                showAlert("Invalid phone number (10 digits required)", "danger", "signupAlert");
                return;
            }
            
            if (password !== confirm) {
                showAlert("Passwords do not match", "danger", "signupAlert");
                return;
            }
            
            if (password.length < 6) {
                showAlert("Password must be at least 6 characters", "danger", "signupAlert");
                return;
            }
            
            if (!terms.checked) {
                showAlert("Please agree to the Terms and Conditions", "danger", "signupAlert");
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
                updateUploadButtonState();
                updateNavigation();
                
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1000);
            } else {
                showAlert(result.message, "danger", "signupAlert");
            }
        });
    }
    
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
