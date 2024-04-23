// Canvas setup
var canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('image_canvas'));
var grid_canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('grid_canvas'));
var canvas_upload = document.getElementById("canvas_upload");

var ctx = canvas.getContext("2d");
var grid_ctx = grid_canvas.getContext("2d");

var maxWidth = vw(65);
var maxHeight = vh(65);
canvas.width = maxWidth;
canvas.height = maxHeight;

grid_canvas.width = maxWidth;
grid_canvas.height = maxHeight;

canvas_upload.style.width = maxWidth + "px";
canvas_upload.style.height = maxHeight + "px";

// #region ( Elements )
var sidebar = document.getElementById("sidebar");
var toolbar = document.getElementById("toolbar");

var canvas_container = document.getElementById("canvas_container");
var background_canvas = document.getElementById("background-canvas");

// Sidebar buttons
var grid_grab_button = document.getElementById("grid_grab_button");
// var image_grab_button = document.getElementById("image_grab_button");

var lock_toggle_button = document.getElementById("lock_toggle_button");
var image_upload_button = document.getElementById("image_upload_button");

var grid_toggle_button = document.getElementById("grid_toggle_button");

// Toolbar inputs 
var unit_selector = document.getElementById("units");
var gap_width_input = document.getElementById("gap_width_input");
var gap_weight_input = document.getElementById("gap_weight_input");
var stroke_alpha_input = document.getElementById("stroke_alpha_input");
var colour_picker_input = document.getElementById("colour_picker_input");
var color_picker_empty_div = document.getElementById("color_picker_empty_div");
// #endregion

// #region ( Variables )
var uploadedImageReference = null;
var uploadedImageObject = null;
var canvas_upload_disabled = false;

// var image_grab_toggle = true;
var grid_grab_toggle = false; 
var new_image = true;

var previousMouseX = 0;
var previousMouseY = 0;

var gridOriginX = 0;
var gridOriginY = 0;
var absoluteGridOriginX = 0;
var absoluteGridOriginY = 0;

// Image values 
var ratio = 1;
var imageScaling = 1;
var imageOriginX = 0;
var imageOriginY = 0;
var centerShift_x = 0;
var centerShift_y = 0;
var imageScalingFactor = 0.25;
var lock_toggle_on = false; 


// Grid values
var gapWidth = 2; 
var minGapWidth = 1;
var absoluteGapWidth = gapWidth * 38; 
var gapWidthUnits = "centimeters";

var lineWeight = 1; 
var showGrid = false; 
var strokeColor = "#39FF14";
var strokeAlpha = 1; 
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

    if(canvas_upload != null) {
        canvas_upload.style.width = maxWidth + "px";
        canvas_upload.style.height = maxHeight + "px";
    }

    toolbar.style.width = canvas.width + "px";
    sidebar.style.height = canvas.height + "px";
    background_canvas.style.width = canvas.width + "px";
    background_canvas.style.height = canvas.height + "px";

    if(showGrid)
        drawGrid(gridOriginX, gridOriginY);

    if(uploadedImageReference == null) {
        drawText();
        return; 
    }

    clearTimeout(timeout);
    timeout = setTimeout(redrawImage, 250);
});

var dragActive = false; 
canvas_container.addEventListener("pointerdown", (e) => {
    if(e.button == 1) 
        grid_grab_toggle = !grid_grab_toggle;

    var mousePos = getCursorPosition(canvas, e);
    previousMouseX = mousePos.x;
    previousMouseY = mousePos.y;

    dragActive = true;
});

// canvas_upload.addEventListener("click", (e) => {
//     if(uploadedImageReference == null && !showGrid)
//         image_upload_button.click();    
// });

window.addEventListener("pointerup", (e) => {
    dragActive = false;
    if(e.button == 1) 
        grid_grab_toggle = !grid_grab_toggle;
});

window.addEventListener("pointermove", (e) => {
    var mousePos = getCursorPosition(canvas, e);
    
    if(!dragActive)
        return; 

    if(grid_grab_toggle && showGrid) {
        gridOriginX = gridOriginX - ((previousMouseX - mousePos.x) / imageScaling);
        gridOriginY = gridOriginY - ((previousMouseY - mousePos.y) / imageScaling);

        absoluteGridOriginX = absoluteGridOriginX - ((previousMouseX - mousePos.x) / imageScaling);
        absoluteGridOriginY = absoluteGridOriginY - ((previousMouseY - mousePos.y) / imageScaling);
    
        grid_ctx.clearRect(0, 0, grid_canvas.width, grid_canvas.height);
        drawGrid(gridOriginX, gridOriginY);
    }

    if((!lock_toggle_on && uploadedImageObject != null && !showGrid) || 
       (!lock_toggle_on && uploadedImageObject != null && !grid_grab_toggle)) {
        imageOriginX = imageOriginX - ((previousMouseX - mousePos.x) / imageScaling);
        imageOriginY = imageOriginY - ((previousMouseY - mousePos.y) / imageScaling);
    
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        displayImage(uploadedImageReference)

        gridOriginX = gridOriginX - ((previousMouseX - mousePos.x) / imageScaling);
        gridOriginY = gridOriginY - ((previousMouseY - mousePos.y) / imageScaling);
        
        if(showGrid) {
            grid_ctx.clearRect(0, 0, grid_canvas.width, grid_canvas.height);
            drawGrid(gridOriginX, gridOriginY);
        }
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
    
    if(showGrid)      
        drawGrid(gridOriginX, gridOriginY);
});
// #endregion

//#region ( Sidebar/Toolbar Input Listeners ) 
// ::DEPRECATED::
// function image_grab_listener() {
//     image_grab_toggle = !image_grab_toggle;

//     image_grab_button.classList.remove("selected");
//     if(image_grab_toggle) {
//         image_grab_button.classList.add("selected");

//         grid_grab_toggle = false;
//         grid_grab_button.classList.remove("selected");
//     }
// }

function grid_grab_listener() {
    grid_grab_toggle = !grid_grab_toggle;

    grid_grab_button.classList.remove("selected");
    if(grid_grab_toggle) {
        grid_grab_button.classList.add("selected");

        // ::DEPRECATED::
        // image_grab_toggle = false;
        // image_grab_button.classList.remove("selected");
    }
}

image_upload_button.addEventListener("change", () => {
    const files = image_upload_button.files;
    handle_upload(files);
    canvas_upload.remove();
    canvas_upload = null;
});

canvas_upload.addEventListener("change", () => {
    const files = canvas_upload.files;
    handle_upload(files);
    canvas_upload.remove();
    canvas_upload = null;
});

function handle_upload(files) {
    if(uploadedImageReference != files[0])
        new_image = true; 
    uploadedImageReference = files[0];

    // Not sure if having aspect ratio toggle on by default is good
    lock_toggle_button.classList.add("selected");
    lock_toggle_on = true;

    imageScaling = 1;
    imageOriginX = 0;
    imageOriginY = 0;
    gridOriginX = 0;
    gridOriginY = 0;
    absoluteGridOriginX = 0;
    absoluteGridOriginY = 0;

    displayImage(uploadedImageReference);
}

function download_image() {
    ctx.drawImage(grid_canvas, 0, 0);

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

    grid_canvas.width = vw(65);
    grid_canvas.height = vh(65);
    if(showGrid && lock_toggle_on) 
        drawGrid(gridOriginX + centerShift_x, gridOriginY + centerShift_y);
    else if(showGrid)
        drawGrid(gridOriginX, gridOriginY);
    grid_canvas.classList.remove("fullscreen_canvas_container")

    canvas.width = vw(65);
    canvas.height = vh(65);
    displayImage(uploadedImageReference);
    canvas_container.classList.remove("fullscreen_canvas_container")

    if(uploadedImageReference == null) 
        drawText();
}

 /* 
 Create a PNG image of the pixels drawn on the 
 canvas using the toDataURL method. PNG is the 
 preferred format since it is supported by all browsers
 */
var download_timeout;
function image_download_listener() {
    if(uploadedImageReference == null && showGrid) {
        drawGrid(absoluteGridOriginX, absoluteGridOriginY);
        ctx.clearRect(0, 0, canvas.width, canvas.height);       
        clearTimeout(download_timeout);
        download_timeout = setTimeout(download_image, 250);
        return;
    } else if (uploadedImageReference == null) {        
        return;
    }

    var previousImageOriginX = imageOriginX;
    var previousImageOriginY = imageOriginY;
    var previousImageScaling = imageScaling;

    imageOriginX = 0;
    imageOriginY = 0;
    imageScaling = 1; 
    
    canvas.width = uploadedImageObject.width;
    canvas.height = uploadedImageObject.height;
    canvas_container.classList.add("fullscreen_canvas_container")

    // if(uploadedImageObject.width > grid_canvas.width)
    grid_canvas.width = uploadedImageObject.width;

    // if(uploadedImageObject.height > grid_canvas.height)
    grid_canvas.height = uploadedImageObject.height;

    grid_canvas.classList.add("fullscreen_canvas_container")

    // img.width*ratio,
    // img.height*ratio
    if(lock_toggle_on && showGrid) {
        imageScaling = 1/ratio;
        drawGrid(absoluteGridOriginX - centerShift_x, absoluteGridOriginY - centerShift_y);    
    } else if(showGrid) {
        drawGrid(absoluteGridOriginX, absoluteGridOriginY);
    }
    displayImage(uploadedImageReference);

    clearTimeout(download_timeout);
    download_timeout = setTimeout(download_image, 250);

    imageOriginX = previousImageOriginX;
    imageOriginY = previousImageOriginY;
    imageScaling = previousImageScaling;
}

function grid_toggle_listener() { 
    console.log("hit toggle");
    showGrid = !showGrid; 

    if(canvas_upload != null) {
        canvas_upload_disabled = !canvas_upload_disabled;
        canvas_upload.disabled = canvas_upload_disabled;
    }
    
    grid_toggle_button.classList.remove("selected");
    if(showGrid) {
        drawGrid(gridOriginX, gridOriginY);
        grid_toggle_button.classList.add("selected");
    }
    else 
        grid_ctx.clearRect(0, 0, grid_canvas.width, grid_canvas.height);

    drawText();
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

    imageScaling = 1;
    imageOriginX = 0;
    imageOriginY = 0;
    gridOriginX = 0;
    gridOriginY = 0;
    absoluteGridOriginX = 0;
    absoluteGridOriginY = 0;
    
    if(uploadedImageReference != null)
        displayImage(uploadedImageReference)
    
    if(showGrid)
        drawGrid(gridOriginX, gridOriginY)
}

function zoom_in_listener() {
    if(lock_toggle_on || uploadedImageReference == null || imageScaling >= 4)
        return;

    imageScaling += imageScalingFactor;
    displayImage(uploadedImageReference);    

    if(showGrid)
        drawGrid(gridOriginX, gridOriginY);
}

function zoom_out_listener() {
    if(lock_toggle_on || uploadedImageReference == null || imageScaling <= imageScalingFactor)
        return;

    imageScaling -= imageScalingFactor;
    displayImage(uploadedImageReference); 

    if(showGrid)
        drawGrid(gridOriginX, gridOriginY);
}

// Toolbar Inputs
unit_selector.addEventListener("change", () => {
    gapWidthUnits = unit_selector.value;

    setAbsoluteGapWidth(gapWidth, gapWidthUnits);

    gapWidth = gapWidth < minGapWidth ? minGapWidth : gapWidth;
    gap_width_input.value = gapWidth;

    setAbsoluteGapWidth(gapWidth, gapWidthUnits);

    if(showGrid)
        drawGrid(gridOriginX, gridOriginY);
});

gap_width_input.addEventListener("change", () => {
    var value = Math.abs(gap_width_input.value)
    gapWidth = value < minGapWidth ? minGapWidth : value;
    gap_width_input.value = gapWidth;
    setAbsoluteGapWidth(gapWidth, gapWidthUnits);

    if(showGrid)
        drawGrid(gridOriginX, gridOriginY);
});

gap_weight_input.addEventListener("change", () => {
    var value = Math.abs(gap_weight_input.value)

    lineWeight = value == 0 ? lineWeight : value; 
    gap_weight_input.value = lineWeight;

    if(showGrid)
        drawGrid(gridOriginX, gridOriginY);
});

stroke_alpha_input.oninput = function() {
    strokeAlpha = parseInt(stroke_alpha_input.value)/100;
    if(showGrid)
        drawGrid(gridOriginX, gridOriginY);
}

colour_picker_input.addEventListener("change", () => {
    strokeColor = colour_picker_input.value;
    color_picker_empty_div.style.backgroundColor = strokeColor;

    if(showGrid)
        drawGrid(gridOriginX, gridOriginY);
});


//#endregion

// #region ( Image Handling )
// Creates new image object and sets its source
function displayImage(image) {
    if(image == null)
        return;

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
function setAbsoluteGapWidth(gap, units) {  
    absoluteGapWidth = gap;
    switch(units) {
        case "pixels":
            absoluteGapWidth = gap;
            minGapWidth = 25;
            break;
        case "inches":
            absoluteGapWidth = gap * 96;
            minGapWidth = 0.25;
            break;
        case "centimeters":
            absoluteGapWidth = gap * 38;
            minGapWidth = 1;
            break;
        case "millimeters":
            absoluteGapWidth = gap * 3.8;
            minGapWidth = 10;
            break;
        default:
            console.error("Invalid unit type provided");
    }
}

//  Draws grid based on gap and origin vector
function drawGrid(originX, originY, rectWidth=grid_canvas.width, rectHeight=grid_canvas.height) {
    grid_ctx.clearRect(0, 0, grid_canvas.width, grid_canvas.height);

    // if(!lock_toggle_on && uploadedImageObject != null) {
    //     rectWidth = uploadedImageObject.width;
    //     rectHeight = uploadedImageObject.height;
    // }

    if(originX >= 0)
        originX -= (absoluteGapWidth*Math.floor(originX / absoluteGapWidth)) + absoluteGapWidth;

    if(originY >= 0)
        originY -= (absoluteGapWidth*Math.floor(originY / absoluteGapWidth)) + absoluteGapWidth;
    
    var rowX = originX;
    var rowY = originY;   
    
    
    grid_ctx.lineWidth = lineWeight;
    grid_ctx.globalAlpha = strokeAlpha;
    grid_ctx.strokeStyle = strokeColor;

    grid_ctx.scale(imageScaling, imageScaling);
    while(rowX < rectWidth/imageScaling) {
        grid_ctx.beginPath();
        grid_ctx.moveTo(rowX, originY);
        grid_ctx.lineTo(rowX, rectHeight/imageScaling);
        grid_ctx.stroke(); 
        
        rowX += absoluteGapWidth;
    }
    
    while(rowY < rectHeight/imageScaling) {
        grid_ctx.beginPath();
        grid_ctx.moveTo(originX, rowY);
        grid_ctx.lineTo(rectWidth/imageScaling, rowY);
        grid_ctx.stroke(); 
        
        rowY += absoluteGapWidth;
    }
    grid_ctx.scale(1/imageScaling, 1/imageScaling);
}
// #endregion

sidebar.style.height = canvas.height + "px";

// Set toolbar and canvas background to inital dimensions
toolbar.style.width = canvas.width + "px";
background_canvas.style.width = canvas.width + "px";
background_canvas.style.height = canvas.height + "px";

drawText();
function drawText() {
    var em = parseFloat(getComputedStyle(canvas).fontSize);

    if(uploadedImageReference != null)
        return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if(!showGrid) {
        ctx.fillStyle = "white";
        // ctx.strk = 2*em;
        ctx.font = `${1 * em}px "Roboto", sans-serif`;
        ctx.fillText("Upload Image", (canvas.width / 2) - (ctx.measureText("Upload Image").width / 2), canvas.height/2);
    }
}
