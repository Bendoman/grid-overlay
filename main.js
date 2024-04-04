var canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas'))
var ctx = canvas.getContext("2d");

// For chaing opacity of overlayed grids
// ctx.globalAlpha = 0.4;

var input = document.querySelector("input");

canvas.width = window.innerWidth / 2;
canvas.height = window.innerHeight / 2;

var image;
input.addEventListener("change", () => {
    const files = input.files;
    image = files[0];
    console.log(image);

    displayImage(image)
})

function displayImage(image) {

    var uploadedImage = new Image();
    uploadedImage.onload = () => {
        ctx.drawImage(uploadedImage, 0, 0);
    }
    uploadedImage.src = URL.createObjectURL(image);

    var test = new Image();
    test.onload = () => {
        ctx.globalAlpha = 0.4;
        ctx.drawImage(test, 0, 0);
        ctx.globalAlpha = 1;
    }
    test.src = "images/testgrid.png";

}



// ctx.rect(0, 0, canvas.width, canvas.height);
// ctx.fillStyle = "orange";
// ctx.fill();
