// Canvas setup
var canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('image_canvas'));
var grid_canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('grid_canvas'));

var ctx = canvas.getContext("2d");
var grid_ctx = grid_canvas.getContext("2d");

var maxWidth = vw(65);
var maxHeight = vh(65);
canvas.width = maxWidth;
canvas.height = maxHeight;

grid_canvas.width = maxWidth;
grid_canvas.height = maxHeight;

// #region ( Elements )
var sidebar = document.getElementById("sidebar");
var toolbar = document.getElementById("toolbar");

var canvas_container = document.getElementById("canvas_container");
var background_canvas = document.getElementById("background-canvas");

// Sidebar buttons
var grid_grab_button = document.getElementById("grid_grab_button");
var image_grab_button = document.getElementById("image_grab_button");

var lock_toggle_button = document.getElementById("lock_toggle_button");
var image_upload_button = document.getElementById("image_upload_button");

// Toolbar inputs 
var unit_selector = document.getElementById("units");
var gap_width_input = document.getElementById("gap_width_input");
// #endregion

// #region ( Variables )
var uploadedImageReference = null;
var uploadedImageObject = null;

var image_grab_toggle = true;
var grid_grab_toggle = false; 
var new_image = true;

var lock_toggle_on = false; 
var imageOriginX = 0;
var imageOriginY = 0;
var previousMouseX = 0;
var previousMouseY = 0;

var gridOriginX = 0;
var gridOriginY = 0;
var imageScaling = 1;
var imageScalingFactor = 0.25;

// Grid values
var gapSize = 1; 
var lineWeight = 1; 
var showGrid = false; 
var strokeColor = "#39FF14";

const centimeterMin = 1; 
const pixelUnitMin = 25; 
const inchUnitMin = 0.25; 
const millimeterGapMin = 10; 

// #endregion

// #region ( Event Listeners )
// Called after timeout to re-draw image
function redrawImage() {
    displayImage(uploadedImageReference);
    return;
}

// Update canvas based on window resize
var timeout; 
window.addEventListener("resize", () => {
    var maxWidth = vw(65);
    var maxHeight = vh(65);
    canvas.width = maxWidth;
    canvas.height = maxHeight;

    grid_canvas.width = maxWidth;
    grid_canvas.height = maxHeight;

    // drawGrid(gapSize, gridOriginX, gridOriginY, canvas.width, canvas.height);

    toolbar.style.width = canvas.width + "px";
    sidebar.style.height = canvas.height + "px";
    background_canvas.style.width = canvas.width + "px";
    background_canvas.style.height = canvas.height + "px";

    if(uploadedImageReference == null)
        return; 

    clearTimeout(timeout);
    timeout = setTimeout(redrawImage, 250);
});

var dragActive = false; 
canvas_container.addEventListener("pointerdown", (e) => {
    var mousePos = getCursorPosition(canvas, e);
    previousMouseX = mousePos.x;
    previousMouseY = mousePos.y;

    dragActive = true;
});

window.addEventListener("pointerup", () => {dragActive = false;});

window.addEventListener("pointermove", (e) => {
    var mousePos = getCursorPosition(canvas, e);
    
    if(!dragActive || uploadedImageReference == null)
        return; 

    if(grid_grab_toggle) {
        gridOriginX = gridOriginX - (previousMouseX - mousePos.x);
        gridOriginY = gridOriginY - (previousMouseY - mousePos.y);
        // originXinput.value = gridOriginX;
        // originYinput.value = gridOriginY;
    
        grid_ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid(gapSize, gridOriginX, gridOriginY, canvas.width, canvas.height);
    }

    if(image_grab_toggle && !lock_toggle_on) {
        imageOriginX = imageOriginX - ((previousMouseX - mousePos.x) / imageScaling);
        imageOriginY = imageOriginY - ((previousMouseY - mousePos.y) / imageScaling);
        // originXinput.value = imageOriginX;
        // originYinput.value = imageOriginY;
    
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        displayImage(uploadedImageReference)
    }
    previousMouseX = mousePos.x;
    previousMouseY = mousePos.y;
});

canvas_container.addEventListener("wheel", (e) => {
    if(lock_toggle_on || uploadedImageReference == null)
        return;

    if(e.deltaY > 0 && imageScaling > imageScalingFactor)
        imageScaling -= imageScalingFactor;
    else if(e.deltaY < 0 && imageScaling <= 4)
        imageScaling += imageScalingFactor;
    displayImage(uploadedImageReference);        
});
// #endregion

//#region ( Sidebar/Toolbar Input Listeners ) 
function image_grab_listener() {
    image_grab_toggle = !image_grab_toggle;

    image_grab_button.classList.remove("selected");
    if(image_grab_toggle) {
        image_grab_button.classList.add("selected");

        grid_grab_toggle = false;
        grid_grab_button.classList.remove("selected");
    }
}

function grid_grab_listener() {
    grid_grab_toggle = !grid_grab_toggle;

    grid_grab_button.classList.remove("selected");
    if(grid_grab_toggle) {
        grid_grab_button.classList.add("selected");

        image_grab_toggle = false;
        image_grab_button.classList.remove("selected");
    }
}

image_upload_button.addEventListener("change", () => {
    const files = image_upload_button.files;

    if(uploadedImageReference != files[0])
        new_image = true; 
    uploadedImageReference = files[0];

    lock_toggle_button.classList.add("selected");
    lock_toggle_on = true;
    
    displayImage(uploadedImageReference);
    imageOriginX = 0;
    imageOriginY = 0;
    imageScaling = 1;
});

function download_image() {
    if(lock_toggle_on) {
        ctx.clearRect(0, 0, centerShift_x, canvas.height);
        ctx.clearRect(centerShift_x + dWidth, 0, canvas.width, canvas.height);
    }

    var dataURL = canvas.toDataURL("image/png");
    // Create a dummy link text
    var a = document.createElement('a');
    // Set the link to the image so that when clicked, the image begins downloading
    a.href = dataURL;
    // Specify the image filename
    a.download = 'canvas-download.png';
    // Click on the link to set off download
    a.click();

    canvas.width = vw(65);
    canvas.height = vh(65);
    displayImage(uploadedImageReference);
    canvas_container.classList.remove("fullscreen_canvas_container")
}

 /* 
 Create a PNG image of the pixels drawn on the 
 canvas using the toDataURL method. PNG is the 
 preferred format since it is supported by all browsers
 */
var download_timeout;
function image_download_listener() {
    if(uploadedImageReference == null)
        return;

    var previousImageOriginX = imageOriginX;
    var previousImageOriginY = imageOriginY;
    var previousImageScaling = imageScaling;

    imageOriginX = 0;
    imageOriginY = 0;
    imageScaling = 1; 


    canvas_container.classList.add("fullscreen_canvas_container")
    canvas.width = uploadedImageObject.width;
    canvas.height = uploadedImageObject.height;

    displayImage(uploadedImageReference);

    clearTimeout(download_timeout);
    download_timeout = setTimeout(download_image, 250);

    imageOriginX = previousImageOriginX;
    imageOriginY = previousImageOriginY;
    imageScaling = previousImageScaling;
}

function grid_toggle_listener() {
    console.log("grid_toggle_listener()");
}

// TODO Add fullscreen functionality
// function fullscreen_toggle_listener() {
//     console.log("fullscreen_toggle_listener()");
// }

// Handling image centering lock toggle
function lock_toggle_listener() {
    lock_toggle_on = !lock_toggle_on;

    lock_toggle_button.classList.remove("selected");
    if(lock_toggle_on)
        lock_toggle_button.classList.add("selected");

    if(uploadedImageReference != null)
        displayImage(uploadedImageReference)
}

function zoom_in_listener() {
    if(lock_toggle_on || uploadedImageReference == null || imageScaling >= 4)
        return;

    console.log("Zoom in");
    imageScaling += imageScalingFactor;
    displayImage(uploadedImageReference);    
}

function zoom_out_listener() {
    if(lock_toggle_on || uploadedImageReference == null || imageScaling <= imageScalingFactor)
        return;

    console.log("Zoom in");
    imageScaling -= imageScalingFactor;
    displayImage(uploadedImageReference); 

    console.log("Zoom out");
}

// Toolbar Inputs
gap_width_input.addEventListener("change", () => {
    var value = Math.abs(gap_width_input.value)
    gapSize = value == 0 ? 1 : value;
    gap_width_input.value = gapSize;
});
//#endregion

// #region ( Image Handling )
// Creates new image object and sets its source
function displayImage(image) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if(!new_image) {
        if(lock_toggle_on)
            drawImageScaled(uploadedImageObject);
        else 
            drawImageNonScaled(uploadedImageObject);
        return; 
    }

    uploadedImageObject = new Image();
    uploadedImageObject.onload = () => {
        if(lock_toggle_on)
            drawImageScaled(uploadedImageObject);
        else 
            drawImageNonScaled(uploadedImageObject);
    }
    uploadedImageObject.src = URL.createObjectURL(image);
    new_image = false;
}

function drawImageNonScaled(img) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(imageScaling, imageScaling);
    ctx.drawImage(img, imageOriginX, imageOriginY);
    ctx.scale(1/imageScaling, 1/imageScaling);
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
// #endregion

// #region ( Grid Handling )
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
// #endregion

sidebar.style.height = canvas.height + "px";

// Display initial text
ctx.fillStyle = "white";
ctx.fillText("Upload Image", (canvas.width / 2) - (ctx.measureText("Upload Image").width / 2), canvas.height/2);

// Set toolbar and canvas background to inital dimensions
toolbar.style.width = canvas.width + "px";
background_canvas.style.width = canvas.width + "px";
background_canvas.style.height = canvas.height + "px";
