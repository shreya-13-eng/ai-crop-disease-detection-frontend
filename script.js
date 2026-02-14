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
    const formData = new FormData();
    formData.append("image", imageFile);
    const request = new Request("http://localhost:8080/predict", {
        method: "POST",
        body: formData
    })

    fetch(request)
        .then(async (response) => {
            if (response.status !== 200) {
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