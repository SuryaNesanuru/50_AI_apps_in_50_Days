// Get all the DOM elements
const imageInput = document.getElementById('imageInput');
const statusDisplay = document.getElementById('status');
const outputCanvas = document.getElementById('outputCanvas');
const ctx = outputCanvas.getContext('2d'); // Get the "context" for drawing

let model = null; // Variable to hold the AI model

// 1. Load the AI Model
async function loadModel() {
    statusDisplay.textContent = 'Loading AI model... (This may take a moment)';
    try {
        model = await cocoSsd.load(); // Load the COCO-SSD model
        statusDisplay.textContent = 'Model loaded. Please upload an image.';
    } catch (error) {
        console.error('Error loading model:', error);
        statusDisplay.textContent = 'Error: Could not load AI model.';
    }
}
loadModel(); // Load the model as soon as the page loads

// 2. Event Listener for Image Upload
imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];

    if (!file || !model) {
        return; // No file or model isn't loaded yet
    }

    // Clear the canvas
    ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);

    // Create a new Image object
    const img = new Image();
    
    // Once the image is loaded in the browser...
    img.onload = () => {
        // Set canvas dimensions to match the image
        outputCanvas.width = img.width;
        outputCanvas.height = img.height;
        
        // Draw the image onto the canvas
        ctx.drawImage(img, 0, 0);

        // Make the canvas visible
        outputCanvas.style.display = 'block';

        // Run detection on the image
        detectObjects(img);
    };
    
    // Load the image from the file
    const reader = new FileReader();
    reader.onload = (e) => {
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

// 3. Run the Object Detection
async function detectObjects(img) {
    statusDisplay.textContent = 'Detecting objects...';
    
    try {
        // Get predictions from the model
        const predictions = await model.detect(img);
        statusDisplay.textContent = `Found ${predictions.length} objects.`;

        // Draw the bounding boxes for each prediction
        drawBoundingBoxes(predictions);

    } catch (error) {
        console.error('Error during detection:', error);
        statusDisplay.textContent = 'Error: Could not detect objects.';
    }
}

// 4. Draw the Bounding Boxes
function drawBoundingBoxes(predictions) {
    // Loop over each prediction
    predictions.forEach(prediction => {
        // Get the coordinates and dimensions of the box
        const [x, y, width, height] = prediction.bbox;
        const label = prediction.class;
        const score = Math.round(prediction.score * 100);

        // --- Draw the Box ---
        ctx.beginPath();
        ctx.strokeStyle = '#00FFFF'; // A bright cyan color
        ctx.lineWidth = 2;
        ctx.rect(x, y, width, height); // Define the rectangle
        ctx.stroke(); // Draw it

        // --- Draw the Label ---
        ctx.fillStyle = '#00FFFF';
        ctx.font = '18px Arial';
        const text = `${label} (${score}%)`;
        
        // Place text just above the box
        ctx.fillText(text, x, y > 20 ? y - 5 : y + 18);
    });
}