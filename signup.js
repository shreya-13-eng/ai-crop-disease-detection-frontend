import SessionManager from "./sessionManager.js";

const session = SessionManager.getInstance();
let username = "";

// ================= ALERT =================
function showAlert(message, type, containerId) {
    const alertContainer = document.getElementById(containerId);
    if (!alertContainer) return;

    alertContainer.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
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


// ================= LOADING =================
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.remove('d-none');
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.add('d-none');
}

function updatePasswordStrength() {
    const password = passwordInput.value;
    let strength = 0;

    if (password.length >= 6) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[@$!%*?&]/.test(password)) strength += 20;

    strengthBar.style.width = strength + "%";

    if (strength <= 20) {
        strengthBar.className = "progress-bar bg-danger";
        strengthText.innerText = "Weak";
    } else if (strength <= 40) {
        strengthBar.className = "progress-bar bg-warning";
        strengthText.innerText = "Moderate";
    } else if (strength <= 60) {
        strengthBar.className = "progress-bar bg-info";
        strengthText.innerText = "Good";
    } else {
        strengthBar.className = "progress-bar bg-success";
        strengthText.innerText = "Strong";
    }
}

function validateForm() {
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const phone = document.getElementById('signupPhone').value.trim();
    const password = passwordInput.value;
    const confirm = confirmPassword.value;
    let isValid = true;
    if (!name || !email || !phone) isValid = false;
    if (password.length < 6) isValid = false;
    if (password !== confirm) isValid = false;
    confirmPassword.style.borderColor =
        password === confirm && confirm ? "green" : "red";

    submitBtn.disabled = !isValid;
}

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
async function verifyOtpApi(data) {
    const response = await fetch('http://localhost:8080/api/public/verify-otp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    return await response.json();
}
document.addEventListener('DOMContentLoaded', function () {
    const signupForm = document.getElementById('signupForm');
    const passwordInput = document.getElementById('signupPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const strengthBar = document.getElementById('passwordStrengthBar');
    const strengthText = document.getElementById('strengthText');
    const submitBtn = document.getElementById('signupSubmitBtn');
    submitBtn.disabled = true;
    function updatePasswordStrength() {
        const password = passwordInput.value;
        let strength = 0;

        if (password.length >= 6) strength += 20;
        if (/[a-z]/.test(password)) strength += 20;
        if (/[A-Z]/.test(password)) strength += 20;
        if (/[0-9]/.test(password)) strength += 20;
        if (/[@$!%*?&]/.test(password)) strength += 20;

        strengthBar.style.width = strength + "%";

        if (strength <= 20) {
            strengthBar.className = "progress-bar bg-danger";
            strengthText.innerText = "Weak";
        } else if (strength <= 40) {
            strengthBar.className = "progress-bar bg-warning";
            strengthText.innerText = "Moderate";
        } else if (strength <= 60) {
            strengthBar.className = "progress-bar bg-info";
            strengthText.innerText = "Good";
        } else {
            strengthBar.className = "progress-bar bg-success";
            strengthText.innerText = "Strong";
        }
    }

    function validateForm() {
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const phone = document.getElementById('signupPhone').value.trim();
        const password = passwordInput.value;
        const confirm = confirmPassword.value;
        let isValid = true;
        if (!name || !email || !phone) isValid = false;
        if (password.length < 6) isValid = false;
        if (password !== confirm) isValid = false;
        confirmPassword.style.borderColor =
            password === confirm && confirm ? "green" : "red";

        submitBtn.disabled = !isValid;
    }
    document.querySelectorAll('#signupForm input').forEach(input => {
        input.addEventListener('input', () => {
            validateForm();
            updatePasswordStrength();
        });
    });
    signupForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        console.log("sign up clicked");
        const name = document.getElementById('signupName').value.trim();
        username = document.getElementById('signupEmail').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const phone = document.getElementById('signupPhone').value.trim();
        const password = passwordInput.value;
        const confirm = confirmPassword.value;
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
            showAlert("OTP sent to your email", "success", "signupAlert");
            document.getElementById('signupSection').style.display = "none";
            document.getElementById('otpSection').style.display = "block";
        } else {
            showAlert(result.message, "danger", "signupAlert");
        }
    });
})

document.addEventListener('DOMContentLoaded', function () {
    const otpInput = document.getElementById('otpInput');
    const otpBtn = document.getElementById('verifyOtpBtn');

    if (otpInput && otpBtn) {
        otpInput.addEventListener('input', function () {

            const value = this.value.trim();
            if (value.length === 6 && /^\d{6}$/.test(value)) {
                otpBtn.disabled = false;
            } else {
                otpBtn.disabled = true;
            }

        });
    }

    document.getElementById('otpForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        const otp = document.getElementById('otpInput').value.trim();
        if (!otp) {
            showAlert("Enter OTP", "danger", "otpAlert");
            return;
        }

        const verifyBtn = document.getElementById('verifyOtpBtn');

        verifyBtn.disabled = true;
        verifyBtn.innerHTML = "Verifying...";

        const result = await verifyOtpApi({
            username: username,
            otp: otp
        });
        console.log(result);

        verifyBtn.disabled = false;
        verifyBtn.innerHTML = "Verify OTP";

        const userData = {
            userName: result.userName,
            role: result.role,
            fullName: result.fullName,
            token: result.token
        };
        if (result.token) {
            session.login(userData)

            showAlert("OTP Verified Successfully", "success", "otpAlert");

            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);


        } else {
            showAlert(result.error, "danger", "otpAlert");
        }
    });

});