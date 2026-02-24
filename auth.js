// auth.js - Authentication Functions

// User data storage (in real app, this would be backend)
let users = JSON.parse(localStorage.getItem('users')) || [];

// Toggle password visibility
function togglePassword(inputId, iconId) {
    const passwordInput = document.getElementById(inputId);
    const toggleIcon = document.getElementById(iconId);
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('bi-eye');
        toggleIcon.classList.add('bi-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('bi-eye-slash');
        toggleIcon.classList.add('bi-eye');
    }
}

// Show alert message
function showAlert(message, type, containerId) {
    const alertContainer = document.getElementById(containerId);
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
        <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : type === 'error' ? 'bi-exclamation-circle-fill' : 'bi-exclamation-triangle-fill'}"></i>
        <span>${message}</span>
    `;
    
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alertDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate phone number (simple validation)
function validatePhone(phone) {
    const re = /^\d{10}$/;
    return re.test(phone);
}

// Check password strength
function checkPasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    if (password.match(/[$@#&!]+/)) strength++;
    
    return strength;
}

// Update password strength indicator
function updatePasswordStrength(password) {
    const strength = checkPasswordStrength(password);
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    
    if (strength <= 2) {
        strengthBar.className = 'strength-bar weak';
        strengthText.textContent = 'Weak';
        strengthText.style.color = '#f44336';
    } else if (strength <= 4) {
        strengthBar.className = 'strength-bar medium';
        strengthText.textContent = 'Medium';
        strengthText.style.color = '#ff9800';
    } else {
        strengthBar.className = 'strength-bar strong';
        strengthText.textContent = 'Strong';
        strengthText.style.color = '#4caf50';
    }
}

// Login function
function login(emailOrPhone, password) {
    // Find user by email or phone
    const user = users.find(u => 
        u.email === emailOrPhone || u.phone === emailOrPhone
    );
    
    if (!user) {
        return { success: false, message: 'User not found!' };
    }
    
    if (user.password !== password) {
        return { success: false, message: 'Incorrect password!' };
    }
    
    // Store logged in user
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    return { 
        success: true, 
        message: 'Login successful!',
        user: user
    };
}

// Signup function
function signup(userData) {
    // Check if user already exists
    const existingUser = users.find(u => 
        u.email === userData.email || u.phone === userData.phone
    );
    
    if (existingUser) {
        return { success: false, message: 'User already exists with this email or phone!' };
    }
    
    // Validate password strength
    if (checkPasswordStrength(userData.password) < 3) {
        return { success: false, message: 'Password is too weak!' };
    }
    
    // Add new user
    users.push(userData);
    localStorage.setItem('users', JSON.stringify(users));
    
    return { success: true, message: 'Registration successful! Please login.' };
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

// Get current user
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Update navigation based on login status
function updateNavigation() {
    const user = getCurrentUser();
    const loginBtn = document.querySelector('[data-bs-target="#loginModal"]');
    
    if (user && loginBtn) {
        loginBtn.innerHTML = `<i class="bi bi-person-circle me-1"></i> ${user.name || 'Farmer'}`;
        
        // Add logout option to dropdown or modal
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'dropdown-item text-danger';
        logoutBtn.innerHTML = '<i class="bi bi-box-arrow-right me-2"></i> Logout';
        logoutBtn.onclick = logout;
        
        // You can add this to a dropdown menu if needed
    }
}

// Initialize authentication
document.addEventListener('DOMContentLoaded', function() {
    updateNavigation();
    
    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailOrPhone = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            // Validate inputs
            if (!emailOrPhone || !password) {
                showAlert('Please fill in all fields!', 'error', 'loginAlert');
                return;
            }
            
            // Attempt login
            const result = login(emailOrPhone, password);
            
            if (result.success) {
                showAlert(result.message, 'success', 'loginAlert');
                
                // Close modal after 1 second
                setTimeout(() => {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                    modal.hide();
                    
                    // Update UI
                    updateNavigation();
                    
                    // Redirect to home or dashboard
                    window.location.href = '#home';
                }, 1000);
            } else {
                showAlert(result.message, 'error', 'loginAlert');
            }
        });
    }
    
    // Signup form handler (if on signup page)
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('signupName').value.trim();
            const email = document.getElementById('signupEmail').value.trim();
            const phone = document.getElementById('signupPhone').value.trim();
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const terms = document.getElementById('termsCheck').checked;
            
            // Validate inputs
            if (!name || !email || !phone || !password || !confirmPassword) {
                showAlert('Please fill in all fields!', 'error', 'signupAlert');
                return;
            }
            
            if (!validateEmail(email)) {
                showAlert('Please enter a valid email address!', 'error', 'signupAlert');
                return;
            }
            
            if (!validatePhone(phone)) {
                showAlert('Please enter a valid 10-digit phone number!', 'error', 'signupAlert');
                return;
            }
            
            if (password !== confirmPassword) {
                showAlert('Passwords do not match!', 'error', 'signupAlert');
                return;
            }
            
            if (!terms) {
                showAlert('Please accept the terms and conditions!', 'error', 'signupAlert');
                return;
            }
            
            // Attempt signup
            const result = signup({
                name: name,
                email: email,
                phone: phone,
                password: password,
                joinDate: new Date().toISOString()
            });
            
            if (result.success) {
                showAlert(result.message, 'success', 'signupAlert');
                
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    window.location.href = 'index.html#login';
                    // Open login modal
                    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                    loginModal.show();
                }, 2000);
            } else {
                showAlert(result.message, 'error', 'signupAlert');
            }
        });
    }
    
    // Password strength checker
    const passwordInput = document.getElementById('signupPassword');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            updatePasswordStrength(this.value);
        });
    }
});