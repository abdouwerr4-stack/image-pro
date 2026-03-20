// Global Variables
let currentConversionType = 'jpg-png';
let selectedFile = null;

// Selection of conversion type
function selectType(type) {
    currentConversionType = type;
    
    // Update UI
    document.querySelectorAll('.type-btn').forEach(btn => btn.classList.remove('active'));
    event.target.closest('.type-btn').classList.add('active');
    
    // Show GIF options if needed
    const gifOptions = document.getElementById('gifOptions');
    if (type === 'gif-png') {
        gifOptions.style.display = 'block';
    } else {
        gifOptions.style.display = 'none';
    }
}

// Upload Area Interactions
function handleDragOver(e) {
    e.preventDefault();
    document.getElementById('uploadArea').classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    document.getElementById('uploadArea').classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    document.getElementById('uploadArea').classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelect({ target: { files } });
    }
}

// Handle File Selection
function handleFileSelect(event) {
    const files = event.target.files;
    if (files.length === 0) return;
    
    selectedFile = files[0];
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(selectedFile.type)) {
        alert('نوع الملف غير مدعوم. الرجاء اختيار صورة صحيحة');
        return;
    }
    
    // Show preview
    displayPreview();
}

// Display Preview
function displayPreview() {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const previewSection = document.getElementById('previewSection');
        const originalImage = document.getElementById('originalImage');
        const originalInfo = document.getElementById('originalInfo');
        const convertingLoader = document.getElementById('convertingLoader');
        const convertedImage = document.getElementById('convertedImage');
        const convertedInfo = document.getElementById('convertedInfo');
        const downloadBtn = document.getElementById('downloadBtn');
        
        // Show preview
        previewSection.style.display = 'block';
        originalImage.src = e.target.result;
        originalInfo.textContent = `${selectedFile.name} - ${(selectedFile.size / 1024).toFixed(2)} KB`;
        
        // Hide converted image and show loader
        convertedImage.style.display = 'none';
        convertedInfo.style.display = 'none';
        downloadBtn.style.display = 'none';
        convertingLoader.style.display = 'block';
        
        // Perform conversion
        setTimeout(() => {
            performConversion(e.target.result);
        }, 500);
    };
    
    reader.readAsDataURL(selectedFile);
}

// Perform Conversion
function performConversion(imagePath) {
    const canvas = document.createElement('canvas');
    const img = new Image();
    
    img.onload = function() {
        const convertedImage = document.getElementById('convertedImage');
        const convertedInfo = document.getElementById('convertedInfo');
        const convertingLoader = document.getElementById('convertingLoader');
        const downloadBtn = document.getElementById('downloadBtn');
        
        // Set canvas size
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        // Draw image
        ctx.drawImage(img, 0, 0);
        
        // Convert based on type
        let outputFormat = 'PNG';
        let mimeType = 'image/png';
        
        if (currentConversionType === 'png-jpg') {
            outputFormat = 'JPG';
            mimeType = 'image/jpeg';
        } else if (currentConversionType === 'webp-png' || currentConversionType === 'jpg-png') {
            outputFormat = 'PNG';
            mimeType = 'image/png';
        }
        
        // Convert canvas to blob
        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            convertedImage.src = url;
            convertedImage.style.display = 'block';
            convertedInfo.textContent = `${outputFormat} - ${(blob.size / 1024).toFixed(2)} KB`;
            convertedInfo.style.display = 'block';
            convertingLoader.style.display = 'none';
            downloadBtn.style.display = 'block';
            
            // Store blob for download
            window.convertedBlob = blob;
            window.outputFormat = outputFormat;
        }, mimeType, 0.95);
    };
    
    img.src = imagePath;
}

// Download Image
function downloadImage() {
    if (!window.convertedBlob) return;
    
    const url = URL.createObjectURL(window.convertedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `converted_image.${window.outputFormat.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Reset Converter
function resetConverter() {
    document.getElementById('previewSection').style.display = 'none';
    document.getElementById('fileInput').value = '';
    selectedFile = null;
    window.convertedBlob = null;
    
    // Scroll to upload area
    document.getElementById('uploadArea').scrollIntoView({ behavior: 'smooth' });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set first type as active
    if (document.querySelector('.type-btn')) {
        document.querySelector('.type-btn').classList.add('active');
    }
    
    // Make upload area clickable
    document.getElementById('uploadArea').addEventListener('click', function() {
        document.getElementById('fileInput').click();
    });
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});
