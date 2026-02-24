// Add these functions at the very top of your script.js

// Toggle password visibility (for login modal)
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

// Forgot password handler
document.addEventListener('DOMContentLoaded', function() {
    const forgotForm = document.getElementById('forgotPasswordForm');
    if (forgotForm) {
        forgotForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('resetEmail').value;
            
            // Show success message
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-success';
            alertDiv.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>Reset instructions sent! Check your email.';
            
            document.getElementById('forgotAlert').innerHTML = '';
            document.getElementById('forgotAlert').appendChild(alertDiv);
            
            // Reset form
            this.reset();
            
            // Close modal after 3 seconds
            setTimeout(() => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('forgotPasswordModal'));
                if (modal) modal.hide();
            }, 3000);
        });
    }
});

// Rest of your existing script.js code below...
// Keep all your existing code from here onward

const uploadBtn = document.getElementById("uploadBtn");
const imageInput = document.getElementById("imageInput");
const searchButton = document.getElementById("scanBtn");

let imageFile = null;

console.log("js loaded")
searchButton.removeAttribute("disabled")
uploadBtn.addEventListener("click", () => {
    imageInput.click();  // this opens file chooser
});

imageInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    imageFile = file
    console.log(file);
});
searchButton.addEventListener("click", () => {
    console.log("request sent")
    // iss line tak sab thik chal raha hai.
    const formData = new FormData();
    formData.append("image", imageFile);
    const request = new Request("http://localhost:8080/predict", {
        method: "POST",
        body: formData
    })

    fetch(request)
        .then(async (response) => {
            if (response.status !== 200) {
                // isme not equal to aaise hi likha jata hai? ha
                const errroMsg = await response.text()
                throw new Error("Something went wrong on API server!:"+errroMsg);
            }
            return response.text();
        })
        .then((response) => {
            const blob = new Blob([response],{type:"text/html"});
            const url =URL.createObjectURL(blob);
            window.open(url,"_blank");
        })
        .catch((error) => {
            console.error(error);
        });
})

