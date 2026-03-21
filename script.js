// Add these functions at the very top of your script.js
import SessionManager from "./sessionManager.js";

const session = SessionManager.getInstance();

// Function to show loading overlay
function showLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('d-none');
    }
}

// Function to hide loading overlay
function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('d-none');
    }
}

// Function to check if user is logged in
function isUserLoggedIn() {
    return session.isLoggedIn();
}

// Function to update UI based on login status
function updateUIForLoginStatus() {
    const isLoggedIn = isUserLoggedIn();
    const uploadBtn = document.getElementById("uploadBtn");
    const cropType = document.getElementById("cropType");
    const growthStage = document.getElementById("growthStage");
    const scanBtn = document.getElementById("scanBtn");
    const loginRequiredMsg = document.getElementById("loginRequiredMsg");
    const uploadArea = document.getElementById("uploadArea");
    
    if (isLoggedIn) {
        if (uploadBtn) uploadBtn.disabled = false;
        if (cropType) cropType.disabled = false;
        if (growthStage) growthStage.disabled = false;
        if (scanBtn) scanBtn.disabled = true;
        if (loginRequiredMsg) loginRequiredMsg.classList.add("d-none");
        if (uploadArea) uploadArea.classList.remove("disabled");
        
        console.log("User is logged in - upload enabled");
    } else {
        if (uploadBtn) uploadBtn.disabled = true;
        if (cropType) cropType.disabled = true;
        if (growthStage) growthStage.disabled = true;
        if (scanBtn) scanBtn.disabled = true;
        if (loginRequiredMsg) loginRequiredMsg.classList.remove("d-none");
        if (uploadArea) uploadArea.classList.add("disabled");
        
        console.log("User is not logged in - upload disabled");
    }
}

const uploadBtn = document.getElementById("uploadBtn");
const imageInput = document.getElementById("imageInput");
const searchButton = document.getElementById("scanBtn");
const uploadArea = document.getElementById("uploadArea");
const imagePreview = document.getElementById("imagePreview");
const previewImg = document.getElementById("previewImg");
const removeImage = document.getElementById("removeImage");

let imageFile = null;

console.log("JS loaded");

// Update UI based on login status
updateUIForLoginStatus();

// Upload button click handler
if (uploadBtn) {
    uploadBtn.addEventListener("click", () => {
        if (!isUserLoggedIn()) {
            alert("Please login first to upload images!");
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
            return;
        }
        imageInput.click();
    });
}

// Upload area click handler
if (uploadArea) {
    uploadArea.addEventListener("click", () => {
        if (!isUserLoggedIn()) {
            alert("Please login first to upload images!");
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
            return;
        }
        imageInput.click();
    });
    
    // Drag and drop handlers
    uploadArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (isUserLoggedIn()) {
            uploadArea.classList.add("dragover");
        }
    });
    
    uploadArea.addEventListener("dragleave", () => {
        uploadArea.classList.remove("dragover");
    });
    
    uploadArea.addEventListener("drop", (e) => {
        e.preventDefault();
        uploadArea.classList.remove("dragover");
        
        if (!isUserLoggedIn()) {
            alert("Please login first to upload images!");
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
            return;
        }
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            handleImageSelect(file);
        }
    });
}

// Image input change handler
if (imageInput) {
    imageInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            handleImageSelect(file);
        }
    });
}

// Handle image selection
function handleImageSelect(file) {
    imageFile = file;
    console.log("Image selected:", file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
        uploadArea.classList.add("d-none");
        imagePreview.classList.remove("d-none");
        
        if (searchButton) {
            searchButton.disabled = false;
        }
    };
    reader.readAsDataURL(file);
}

// Remove image handler
if (removeImage) {
    removeImage.addEventListener("click", () => {
        imageFile = null;
        imageInput.value = "";
        previewImg.src = "";
        uploadArea.classList.remove("d-none");
        imagePreview.classList.add("d-none");
        
        if (searchButton) {
            searchButton.disabled = true;
        }
    });
}

// Scan button click handler
if (searchButton) {
    searchButton.addEventListener("click", () => {
        if (!isUserLoggedIn()) {
            alert("Please login first to scan!");
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
            return;
        }
        
        if (!imageFile) {
            alert("Please select an image first!");
            return;
        }
        
        const cropType = document.getElementById("cropType").value;
        const growthStage = document.getElementById("growthStage").value;
        
        if (!cropType) {
            alert("Please select crop type!");
            return;
        }
        
        if (!growthStage) {
            alert("Please select growth stage!");
            return;
        }
        
        console.log("Request sent - scanning image");
        
        // Show loading overlay
        showLoading();
        
        // Disable scan button
        searchButton.disabled = true;
        const scanningSpinner = document.getElementById("scanningSpinner");
        if (scanningSpinner) {
            scanningSpinner.classList.remove("d-none");
        }
        
        const formData = new FormData();
        formData.append("image", imageFile);
        formData.append("cropType", cropType);
        formData.append("growthStage", growthStage);
        
        const request = new Request("http://localhost:8080/predict", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + session.getToken(),
            },
            body: formData
        });
        
        fetch(request)
            .then(async (response) => {
                hideLoading();
                
                if (response.status !== 200) {
                    const errorMsg = await response.text();
                    throw new Error("Something went wrong on API server: " + errorMsg);
                }
                return response.text();
            })
            .then((response) => {
                const blob = new Blob([response], { type: "text/html" });
                const url = URL.createObjectURL(blob);
                window.open(url, "_blank");
                
                // Show results section
                const resultsSection = document.getElementById("resultsSection");
                const instructionsSection = document.getElementById("instructionsSection");
                if (resultsSection) resultsSection.classList.remove("d-none");
                if (instructionsSection) instructionsSection.classList.add("d-none");
            })
            .catch((error) => {
                console.error(error);
                alert("Error: " + error.message);
                hideLoading();
            })
            .finally(() => {
                searchButton.disabled = false;
                if (scanningSpinner) {
                    scanningSpinner.classList.add("d-none");
                }
            });
    });
}

// Update user navigation after login
function updateUserNavigation() {
    const user = session.getCurrentSession();
    const loginNavBtn = document.getElementById('loginNavBtn');
    const userInfo = document.getElementById('userInfo');
    const userNameDisplay = document.getElementById('userNameDisplay');
    
    if (user && loginNavBtn) {
        if (loginNavBtn) loginNavBtn.classList.add('d-none');
        if (userInfo) userInfo.classList.remove('d-none');
        if (userNameDisplay) userNameDisplay.textContent = user.fullName || user.username;
        
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.onclick = () => {
                session.logout();
                window.location.reload();
            };
        }
    } else if (loginNavBtn) {
        if (loginNavBtn) loginNavBtn.classList.remove('d-none');
        if (userInfo) userInfo.classList.add('d-none');
    }
}

// Initialize user navigation
updateUserNavigation();

// Export functions for global use
window.isUserLoggedIn = isUserLoggedIn;
window.updateUIForLoginStatus = updateUIForLoginStatus;
window.showLoading = showLoading;
window.hideLoading = hideLoading;