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

// Image variables
var uploadedGrid;
var uploadedImage; 

var ratio;
var hRatio;
var vRatio;
var dWidth;
var centerShift_x;
var centerShift_y;

// Elements
var download = document.getElementById('downloadBtn')
var imageUploadInput = document.getElementById("imageUpload");
var originXinput = document.getElementById("gridOriginX");
var originYinput = document.getElementById("gridOriginY");
var gapSizeInput = document.getElementById("gridGapSize");
var colourPickerInput = document.getElementById("colourPicker");
var gapUnitsInput = document.getElementById("units");
var strokeWeightInput = document.getElementById("strokeWeight");

// Grid values
var lineWeight = 3; 
var gridOriginX = 0;
var gridOriginY = 0; 

var gapSize = 40; 
var minGapSize = 25;
var strokeColor = "#39FF14";

// Pointer values
var previousMouseX; 
var previousMouseY; 

// Settings
var prevSettingsX = 0;
var prevSettingsY = 0;
var prevGapSize = gapSize;
var prevLineWeight = lineWeight;

gapSizeInput.value = gapSize;
originXinput.value = gridOriginX;
originYinput.value = gridOriginY;
strokeWeightInput.value = lineWeight;

// Updates grid origin x and y based on text input
originXinput.addEventListener("change", () => {
    if(!isNaN(originXinput.value) && originXinput.value != '') {
        gridOriginX = originXinput.value;
        prevSettingsX = originXinput.value; 

        grid_ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid(gapSize, gridOriginX, gridOriginY, canvas.width, canvas.height);
    } else {
        originXinput.value = prevSettingsX;
    }
});

originYinput.addEventListener("change", () => {
    if(!isNaN(originYinput.value) && originXinput.value != '') {
        gridOriginY = originYinput.value;
        prevSettingsY = originYinput.value; 

        grid_ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid(gapSize, gridOriginX, gridOriginY, canvas.width, canvas.height);
    } else {
        originYinput.value = prevSettingsY;
    }
});

// Updates gapsize based on text input
gapSizeInput.addEventListener("change", () => {
    if(!isNaN(gapSizeInput.value) && gapSizeInput.value >= minGapSize) {
        console.log(parseFloat(gapSizeInput.value));
        gapSize = parseFloat(gapSizeInput.value);
        prevGapSize = gapSize;

        grid_ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid(gapSize, gridOriginX, gridOriginY, canvas.width, canvas.height);

    } else {
        gapSizeInput.value = prevGapSize;
    }
});

gapUnitsInput.addEventListener("change", () => {
    grid_ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(gapSize, gridOriginX, gridOriginY, canvas.width, canvas.height);
});

// Sets grid color based on color picker input
colourPickerInput.addEventListener("change", () => {
    strokeColor = colourPickerInput.value;

    grid_ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(gapSize, gridOriginX, gridOriginY, canvas.width, canvas.height);
});

strokeWeightInput.addEventListener("change", () => {
    if(!isNaN(strokeWeightInput.value) && strokeWeightInput.value > 0) {
        lineWeight = parseFloat(strokeWeightInput.value);
        prevLineWeight = lineWeight;

        grid_ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid(gapSize, gridOriginX, gridOriginY, canvas.width, canvas.height);

    } else {
        strokeWeightInput.value = prevLineWeight;
    }
});

// Update canvas based on window resize
var timeout; 
window.addEventListener("resize", () => {
    var maxWidth = vw(75);
    var maxHeight = vh(75);
    canvas.width = maxWidth;
    canvas.height = maxHeight;

    grid_canvas.width = maxWidth;
    grid_canvas.height = maxHeight;

    drawGrid(gapSize, gridOriginX, gridOriginY, canvas.width, canvas.height);

    clearTimeout(timeout);
    timeout = setTimeout(resizedw, 250);
});

 /* 
 Create a PNG image of the pixels drawn on the 
 canvas using the toDataURL method. PNG is the 
 preferred format since it is supported by all browsers
 */
download.addEventListener('click', () => {    
    ctx.drawImage(grid_canvas, 0, 0);

    ctx.clearRect(0, 0, centerShift_x, canvas.height);
    ctx.clearRect(centerShift_x + dWidth, 0, canvas.width, canvas.height);

    var dataURL = canvas.toDataURL("image/png");
    // Create a dummy link text
    var a = document.createElement('a');
    // Set the link to the image so that when clicked, the image begins downloading
    a.href = dataURL
    // Specify the image filename
    a.download = 'canvas-download.png';
    // Click on the link to set off download
    a.click();

    displayImage(uploadedImage);
 });

var dragActive = false; 
grid_canvas.addEventListener("mousedown", (e) => {
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

    gridOriginX = gridOriginX - (previousMouseX - mousePos.x);
    gridOriginY = gridOriginY - (previousMouseY - mousePos.y);
    originXinput.value = gridOriginX;
    originYinput.value = gridOriginY;

    grid_ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(gapSize, gridOriginX, gridOriginY, canvas.width, canvas.height);

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
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var uploadedImage = new Image();
    uploadedImage.onload = () => {
        drawImageScaled(uploadedImage);
    }
    uploadedImage.src = URL.createObjectURL(image);
}

// Scales image to correct aspect ratio and centers it
function drawImageScaled(img) {
    hRatio = canvas.width  / img.width;
    vRatio =  canvas.height / img.height;
    ratio  = Math.min ( hRatio, vRatio );
    centerShift_x = ( canvas.width - img.width*ratio ) / 2;
    centerShift_y = ( canvas.height - img.height*ratio ) / 2;  
    dWidth = img.width*ratio;
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
    
    gapUnit = gapsize;
    if(gapUnitsInput.value == "pixels") {
        gapUnit = gapSize;
        minGapSize = 25;
    }
    else if(gapUnitsInput.value == "inches") {
        gapUnit = gapSize * 96;
        minGapSize = 0.25;
    } 
    else if(gapUnitsInput.value == "centimeters") {
        gapUnit = gapSize * 38;
        minGapSize = 1;
    }
    else if(gapUnitsInput.value == "millimeters") {
        gapUnit = gapSize * 3.8;
        minGapSize = 10;
    }

    if(gapsize < minGapSize) {
        gapSize = minGapSize;
        gapSizeInput.value = minGapSize;
        drawGrid(gapSize, originX, originY, rectWidth, rectHeight);
    }

    if(originX >= 0)
        originX -= (gapUnit*Math.floor(originX / gapUnit)) + gapUnit;

    if(originY >= 0)
        originY -= (gapUnit*Math.floor(originY / gapUnit)) + gapUnit;
    
    var rowX = originX;
    var rowY = originY;   
    
    
    grid_ctx.lineWidth = lineWeight;
    grid_ctx.strokeStyle = strokeColor;

    while(rowX < rectWidth) {
        grid_ctx.beginPath();
        grid_ctx.moveTo(rowX, originY);
        grid_ctx.lineTo(rowX, rectHeight);
        grid_ctx.stroke(); 
        
        rowX += gapUnit;
    }

    while(rowY < rectHeight) {
        grid_ctx.beginPath();
        grid_ctx.moveTo(originX, rowY);
        grid_ctx.lineTo(rectWidth, rowY);
        grid_ctx.stroke(); 
        
        rowY += gapUnit;
    }
}

function mergeCanvases() {
    ctx.drawImage(grid_canvas, 0, 0); 
    ctx.clearRect();
}

