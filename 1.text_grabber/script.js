const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const statusDisplay = document.getElementById('status');
const resultText = document.getElementById('resultText');
const copyButton = document.getElementById('copyButton');

imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];

    if (!file) {
        return; 
    }

    resultText.value = '';
    copyButton.disabled = true;
    copyButton.textContent = 'Copy Text';

    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        imagePreview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);

    performOCR(file);
});

async function performOCR(file) {
    statusDisplay.textContent = 'Processing... This may take a moment.';

    try {
        const { data: { text } } = await Tesseract.recognize(
            file,
            'eng',
            {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        const progress = Math.round(m.progress * 100);
                        statusDisplay.textContent = `Recognizing text... (${progress}%)`;
                    }
                },
            }
        );

        // Update UI with results
        statusDisplay.textContent = 'Done! Text extracted below.';
        resultText.value = text;
        
        // Enable the copy button if there is text
        if (text.trim().length > 0) {
            copyButton.disabled = false;
        }

    } catch (error) {
        console.error(error);
        statusDisplay.textContent = 'Error: Could not process image. Please try again.';
    }
}

// 3. Event Listener for Copy Button
copyButton.addEventListener('click', () => {
    // Select the text in the textarea
    resultText.select();
    resultText.setSelectionRange(0, 99999); // For mobile devices

    // Use the modern Clipboard API
    navigator.clipboard.writeText(resultText.value)
        .then(() => {
            // Give user feedback
            copyButton.textContent = 'Copied!';
            setTimeout(() => {
                copyButton.textContent = 'Copy Text';
            }, 2000); // Reset button text after 2 seconds
        })
        .catch(err => {
            console.error('Failed to copy text: ', err);
        });
});