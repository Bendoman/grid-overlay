/**
 * For chaing opacity of overlayed grids
 * ctx.globalAlpha = 0.4;
 * 
 */

// Canvas setup
var canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas'));
var grid_canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('grid_canvas'));

var ctx = canvas.getContext("2d");
var grid_ctx = grid_canvas.getContext("2d");

var maxWidth = vw(75);
var maxHeight = vh(75);
canvas.width = maxWidth;
canvas.height = maxHeight;

grid_canvas.width = maxWidth;
grid_canvas.height = maxHeight;

// Images
var uploadedGrid;
var uploadedImage; 

// Elements
var download = document.getElementById('downloadBtn')
var imageUploadInput = document.getElementById("imageUpload");

// Grid values
var lineWeight = 25; 
var gridOriginX = 0;
var gridOriginY = 0; 

// Pointer values
var previousMouseX; 
var previousMouseY; 

// Update canvas based on window resize
var timeout; 
window.addEventListener("resize", () => {
    var maxWidth = vw(75);
    var maxHeight = vh(75);
    canvas.width = maxWidth;
    canvas.height = maxHeight;

    grid_canvas.width = maxWidth;
    grid_canvas.height = maxHeight;

    drawGrid(25, gridOriginX, gridOriginY, canvas.width, canvas.height);

    clearTimeout(timeout);
    timeout = setTimeout(resizedw, 150);
});

 /* 
 Create a PNG image of the pixels drawn on the 
 canvas using the toDataURL method. PNG is the 
 preferred format since it is supported by all browsers
 */
download.addEventListener('click', () => {

    ctx.drawImage(grid_canvas, 0, 0);

     var dataURL = canvas.toDataURL("image/png");
     // Create a dummy link text
     var a = document.createElement('a');
     // Set the link to the image so that when clicked, the image begins downloading
     a.href = dataURL
     // Specify the image filename
     a.download = 'canvas-download.jpeg';
     // Click on the link to set off download
     a.click();
 });

var dragActive = false; 
window.addEventListener("mousedown", (e) => {
    var mousePos = getCursorPosition(canvas, e);
    previousMouseX = mousePos.x;
    previousMouseY = mousePos.y;

    dragActive = true;
});

window.addEventListener("mouseup", () => {dragActive = false;});

window.addEventListener("mousemove", (e) => {
    var mousePos = getCursorPosition(canvas, e);
    
    if(!dragActive)
        return; 

    gridOriginX += (previousMouseX - mousePos.x);
    gridOriginY += (previousMouseX - mousePos.x);
    gridOriginX = mousePos.x;
    gridOriginY = mousePos.y;

    grid_ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(25, gridOriginX, gridOriginY, canvas.width, canvas.height);

    previousMouseX = mousePos.x;
    previousMouseY = mousePos.y;
});

// Called after timeout to re-draw image
function resizedw() {
    displayImage(uploadedImage);
}

// Calls when image is uploaded
imageUploadInput.addEventListener("change", () => {
    const files = imageUploadInput.files;
    uploadedImage = files[0];
    displayImage(uploadedImage)
})

// Creates new image object and sets its source
function displayImage(image) {
    var uploadedImage = new Image();
    uploadedImage.onload = () => {
        drawImageScaled(uploadedImage);
    }
    uploadedImage.src = URL.createObjectURL(image);
}

// Scales image to correct aspect ratio and centers it
function drawImageScaled(img) {
    var canvas = ctx.canvas ;
    var hRatio = canvas.width  / img.width    ;
    var vRatio =  canvas.height / img.height  ;
    var ratio  = Math.min ( hRatio, vRatio );
    var centerShift_x = ( canvas.width - img.width*ratio ) / 2;
    var centerShift_y = ( canvas.height - img.height*ratio ) / 2;  
    
    // Image
    ctx.clearRect(0,0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, 
                    img.width, 
                    img.height,
                    centerShift_x,
                    centerShift_y,
                    img.width*ratio, 
                    img.height*ratio);  
}

//  Draws grid based on gap and origin vector
function drawGrid(gapsize, originX, originY, rectWidth, rectHeight) {
    
    if(originX > 0)
        originX -= (gapsize*Math.floor(originX / gapsize)) + gapsize;

    if(originY > 0)
        originY -= (gapsize*Math.floor(originY / gapsize)) + gapsize;
    
    var rowX = originX;
    var rowY = originY;   
    

    grid_ctx.lineWidth = 3;
    grid_ctx.strokeStyle = "lime";

    while(rowX < rectWidth) {
        grid_ctx.beginPath();
        grid_ctx.moveTo(rowX, originY);
        grid_ctx.lineTo(rowX, rectHeight);
        grid_ctx.stroke(); 
        
        rowX += gapsize;
    }

    while(rowY < rectHeight) {
        grid_ctx.beginPath();
        grid_ctx.moveTo(originX, rowY);
        grid_ctx.lineTo(rectWidth, rowY);
        grid_ctx.stroke(); 
        
        rowY += gapsize;
    }
}

function mergeCanvases() {
    ctx.drawImage(grid_canvas, 0, 0); 
    ctx.clearRect();
}

