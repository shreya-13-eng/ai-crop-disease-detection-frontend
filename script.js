import SessionManager from "./sessionManager.js";

const session = SessionManager.getInstance();

let imageFile = null;

// DOM
const uploadBtn = document.getElementById("uploadBtn");
const imageInput = document.getElementById("imageInput");
const scanBtn = document.getElementById("scanBtn");
const uploadArea = document.getElementById("uploadArea");
const imagePreview = document.getElementById("imagePreview");
const previewImg = document.getElementById("previewImg");
const removeImage = document.getElementById("removeImage");

// ================= LOADING =================
function showLoading() {
    document.getElementById('loadingOverlay')?.classList.remove('d-none');
}
function hideLoading() {
    document.getElementById('loadingOverlay')?.classList.add('d-none');
}

// ================= AUTH =================
function isUserLoggedIn() {
    return session.isLoggedIn();
}

function handleLogoutUI() {
    session.logout();

    // reset upload UI
    imageFile = null;
    uploadArea?.classList.remove("d-none");
    imagePreview?.classList.add("d-none");
    imageInput.value = "";

    // update local UI
    updateUIForLoginStatus();

    // 🔥 IMPORTANT: navbar update (global)
    window.updateUserNavigation();

    // 🔥 notify auth.js also
    window.dispatchEvent(new Event("authChanged"));

    alert("Session expired. Please login again.");
}

// ================= UI =================
function updateUIForLoginStatus() {
    const isLoggedIn = isUserLoggedIn();

    const cropType = document.getElementById("cropType");
    const growthStage = document.getElementById("growthStage");
    const loginRequiredMsg = document.getElementById("loginRequiredMsg");

    if (isLoggedIn) {
        uploadBtn?.removeAttribute("disabled");
        cropType?.removeAttribute("disabled");
        growthStage?.removeAttribute("disabled");
        scanBtn?.setAttribute("disabled", true);
        loginRequiredMsg?.classList.add("d-none");
        uploadArea?.classList.remove("disabled");
    } else {
        uploadBtn?.setAttribute("disabled", true);
        cropType?.setAttribute("disabled", true);
        growthStage?.setAttribute("disabled", true);
        scanBtn?.setAttribute("disabled", true);
        loginRequiredMsg?.classList.remove("d-none");
        uploadArea?.classList.add("disabled");
    }
}

// 🔥 NAVBAR UPDATE (Farmer Login toggle)
function updateUserNavigation() {
    const user = session.getCurrentSession();

    const loginNavBtn = document.getElementById('loginNavBtn');
    const userInfo = document.getElementById('userInfo');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const logoutBtn = document.getElementById('logoutBtn');

    if (user) {
        loginNavBtn?.classList.add('d-none');
        userInfo?.classList.remove('d-none');
        if (userNameDisplay) {
            userNameDisplay.textContent = user.fullName || user.username;
        }

        if (logoutBtn) {
            logoutBtn.onclick = () => handleLogoutUI(); // ✅ no reload
        }
    } else {
        loginNavBtn?.classList.remove('d-none');
        userInfo?.classList.add('d-none');
        if (userNameDisplay) userNameDisplay.textContent = "";
    }
}
async function apiCall(request) {
    try {
        const response = await fetch(request);
        const text = await response.text();

        let data;
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }

        if (!response.ok) {
            let message = typeof data === "object"
                ? data.message || JSON.stringify(data)
                : data;

            if (message.toLowerCase().includes("expired")) {
                handleLogoutUI();


                window.updateUserNavigation();

                window.dispatchEvent(new Event("authChanged"));

                throw new Error("Session expired");
            }

            throw new Error(message);
        }

        return data;

    } catch (error) {
        if (error.message === "Failed to fetch") {
            throw new Error("Network error. Please check your connection.");
        }
        throw error;
    }
}
// ================= IMAGE =================
function handleImageSelect(file) {
    imageFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
        uploadArea.classList.add("d-none");
        imagePreview.classList.remove("d-none");
        scanBtn.disabled = false;
    };
    reader.readAsDataURL(file);
}

// ================= FILE PICKER =================
function openFilePicker() {
    if (!isUserLoggedIn()) {
        alert("Please login first!");
        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
        loginModal.show();
        return;
    }
    imageInput.click();
}

// ================= EVENTS =================

uploadArea?.addEventListener("click", openFilePicker);

imageInput?.addEventListener("change", (e) => {
    if (e.target.files[0]) handleImageSelect(e.target.files[0]);
});

removeImage?.addEventListener("click", () => {
    imageFile = null;
    imageInput.value = "";
    previewImg.src = "";
    uploadArea.classList.remove("d-none");
    imagePreview.classList.add("d-none");
    scanBtn.disabled = true;
});

scanBtn?.addEventListener("click", async () => {
    if (!isUserLoggedIn()) return alert("Please login first!");
    if (!imageFile) return alert("Select image!");

    const cropType = document.getElementById("cropType").value;
    const growthStage = document.getElementById("growthStage").value;

    if (!cropType || !growthStage) {
        return alert("Fill all fields!");
    }

    showLoading();

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("cropType", cropType);
    formData.append("growthStage", growthStage);

    const request = new Request("/predict", {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + session.getToken(),
        },
        body: formData
    });

    try {

        const response = await apiCall(request);
        const data = typeof response === "string" ? JSON.parse(response) : response;
        fillDetectionResults(data);
        const resultsSection = document.getElementById("resultsSection");
        const instructionsSection = document.getElementById("instructionsSection");
        if (resultsSection && instructionsSection) {
            resultsSection.classList.remove("d-none");
            instructionsSection.classList.add("d-none");
        }

    } catch (error) {
        console.error(error);
        if (!error.message.includes("expired")) {
            alert(error.message);
        }
    } finally {
        hideLoading();
    }
});

function fillDetectionResults(data) {
    loadHistory()
    const resultsSection = document.getElementById("resultsSection");
    resultsSection.classList.remove("d-none");

    document.getElementById("diseaseName").innerText = data.diseaseName;
    document.getElementById("diseaseDescription").innerText = data.description;
    document.getElementById("severityBar").className = `severity-bar severity-${data.severity.toLowerCase()}`;
    document.getElementById("severityText").innerText = data.severity;

    const confidenceBar = document.getElementById("confidenceBar");
    confidenceBar.style.width = data.confidence + "%";
    confidenceBar.innerText = data.confidence + "%";


    let color = "#dc3545";
    if (data.confidence >= 80) color = "#28a745";
    else if (data.confidence >= 50) color = "#ffc107";

    confidenceBar.style.backgroundColor = color;

    const treatmentCard = document.querySelector(".treatment-card");
    treatmentCard.innerHTML = `<h4 class="mb-4">Recommended Treatments</h4>`;
    data.treatments.forEach(t => {
        const div = document.createElement("div");
        div.classList.add("mb-4");

        let typeBadgeClass = "";
        if (t.method.toLowerCase().includes("chemical")) typeBadgeClass = "chemical-badge";
        else if (t.method.toLowerCase().includes("organic")) typeBadgeClass = "organic-badge";
        else typeBadgeClass = "prevention-badge";

        div.innerHTML = `
            <h6><span class="badge ${typeBadgeClass} me-2">${t.method}</span> ${t.title}</h6>
            <p>${t.description}</p>
            ${t.note ? `<small class="text-muted"><i class="bi bi-clock me-1"></i> ${t.note}</small>` : ""}
        `;

        treatmentCard.appendChild(div);
    });
}

// ================= INIT =================
updateUIForLoginStatus();
updateUserNavigation();

// global access
window.updateUIForLoginStatus = updateUIForLoginStatus;
window.updateUserNavigation = updateUserNavigation;


async function loadHistory() {
    const table = document.getElementById("historyTable");

    // 1. Not logged in
    if (!session.isLoggedIn()) {
        table.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding:20px;">
                    Login to see scan history
                </td>
            </tr>
        `;
        return;
    }

    try {
        const res = await fetch("/scan-results", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + session.getToken(),
                "Content-Type": "application/json"
            }
        });

        const data = await res.json();

        // 2. Empty data check (YAHI hona chahiye tha)
        if (!data || data.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center; padding:20px;">
                        No scan history available
                    </td>
                </tr>
            `;
            return;
        }

        // 3. Render data
        renderHistory(data);

    } catch (error) {
        console.error(error);
        table.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding:20px; color:red;">
                    Failed to load history
                </td>
            </tr>
        `;
    }
}

function renderHistory(scans) {
    const table = document.getElementById("historyTable");
    table.innerHTML = "";

    scans.forEach(scan => {
        const row = document.createElement("tr");

        const severity = (scan.severity || "").toLowerCase();

        let barClass = "";
        let rowClass = "";

        if (severity === "high") {
            barClass = "severity-high";
            rowClass = "row-high";
        } else if (severity === "medium") {
            barClass = "severity-medium";
            rowClass = "row-medium";
        } else {
            barClass = "severity-low";
            rowClass = "row-low";
        }

        row.innerHTML = `
            <td>${new Date(scan.scanTime).toLocaleDateString()}</td>
            <td>${scan.crop || "N/A"}</td>
            <td>${scan.detectedDiseases?.join(", ") || "N/A"}</td>
            <td>
                <div class="severity-indicator">
                    <div class="severity-bar ${barClass}"></div>
                </div>
            </td>
            <td>${scan.recommendedTreatment?.join(", ") || "N/A"}</td>
            <td>${scan.confidenceScore ? scan.confidenceScore.toFixed(2) : "0.00"}%</td>
        `;

        row.classList.add(rowClass);
        table.appendChild(row);
    });
}

// Always call on load
window.addEventListener("load", loadHistory);