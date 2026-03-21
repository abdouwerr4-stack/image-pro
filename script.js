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
    
    // Show threshold option for remove-bg if needed
    const removeBgOptions = document.getElementById('removeBgOptions');
    if (type === 'remove-bg' && removeBgOptions) {
        removeBgOptions.style.display = 'block';
    } else if (removeBgOptions) {
        removeBgOptions.style.display = 'none';
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
    if (currentConversionType === 'remove-bg') {
        performRemoveBackground(imagePath);
        return;
    }
    
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

// Remove Background Function
function performRemoveBackground(imagePath) {
    const canvas = document.createElement('canvas');
    const img = new Image();
    
    img.onload = function() {
        const convertedImage = document.getElementById('convertedImage');
        const convertedInfo = document.getElementById('convertedInfo');
        const convertingLoader = document.getElementById('convertingLoader');
        
        // Set canvas size
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        // Draw image
        ctx.drawImage(img, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Get threshold (default 30)
        const thresholdInput = document.getElementById('bgThreshold');
        const threshold = thresholdInput ? parseInt(thresholdInput.value) : 30;
        
        // Detect background color from corners
        const bgColor = detectBackgroundColor(data, canvas.width, canvas.height);
        
        // Make background transparent
        removeBackgroundColor(data, bgColor, threshold);
        
        // Put modified image data back
        ctx.putImageData(imageData, 0, 0);
        
        // Convert to PNG (PNG supports transparency)
        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            convertedImage.src = url;
            convertedImage.style.display = 'block';
            convertedInfo.textContent = `PNG - ${(blob.size / 1024).toFixed(2)} KB`;
            convertedInfo.style.display = 'block';
            convertingLoader.style.display = 'none';
            
            const downloadBtn = document.getElementById('downloadBtn');
            downloadBtn.style.display = 'block';
            
            // Store blob for download
            window.convertedBlob = blob;
            window.outputFormat = 'PNG';
        }, 'image/png', 1.0);
    };
    
    img.crossOrigin = 'anonymous';
    img.src = imagePath;
}

// Detect background color from image corners
function detectBackgroundColor(data, width, height) {
    const colors = [];
    
    // Sample colors from corners
    const samples = [
        { x: 5, y: 5 },           // Top-left
        { x: width - 5, y: 5 },   // Top-right
        { x: 5, y: height - 5 },  // Bottom-left
        { x: width - 5, y: height - 5 } // Bottom-right
    ];
    
    samples.forEach(sample => {
        const idx = (sample.y * width + sample.x) * 4;
        colors.push({
            r: data[idx],
            g: data[idx + 1],
            b: data[idx + 2],
            a: data[idx + 3]
        });
    });
    
    // Return average color (most likely background)
    const avg = {
        r: Math.round(colors.reduce((sum, c) => sum + c.r, 0) / colors.length),
        g: Math.round(colors.reduce((sum, c) => sum + c.g, 0) / colors.length),
        b: Math.round(colors.reduce((sum, c) => sum + c.b, 0) / colors.length)
    };
    
    return avg;
}

// Remove background color by making it transparent
function removeBackgroundColor(data, bgColor, threshold) {
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Calculate color similarity
        const diff = Math.abs(r - bgColor.r) + Math.abs(g - bgColor.g) + Math.abs(b - bgColor.b);
        
        // If color is similar to background, make it transparent
        if (diff < threshold * 3) {
            data[i + 3] = 0; // Set alpha to 0 (transparent)
        }
    }
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
    
    // Record conversion in dashboard
    recordConversion(currentConversionType);
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

// Record conversion in dashboard
function recordConversion(type) {
    let stats = JSON.parse(localStorage.getItem('imageProStats')) || {};
    
    // Initialize objects if needed
    if (!stats.conversionsByType) {
        stats.conversionsByType = {};
    }
    if (!stats.visitorDates) {
        stats.visitorDates = [];
    }
    if (!stats.dailyConversions) {
        stats.dailyConversions = {};
    }

    // Get current date
    const today = new Date().toISOString().split('T')[0];
    const timestamp = new Date().toISOString();

    // Record conversion by type (all-time)
    stats.conversionsByType[type] = (stats.conversionsByType[type] || 0) + 1;

    // Record daily conversion count
    if (!stats.dailyConversions[today]) {
        stats.dailyConversions[today] = 0;
    }
    stats.dailyConversions[today]++;

    // Record conversion with timestamp for today
    const typeId = type + '_' + today;
    stats[typeId] = (stats[typeId] || 0) + 1;

    // Store conversion timestamp for activity log
    if (!stats.recentConversions) {
        stats.recentConversions = [];
    }
    stats.recentConversions.push({
        type: type,
        timestamp: timestamp
    });

    // Keep only last 100 conversions
    if (stats.recentConversions.length > 100) {
        stats.recentConversions = stats.recentConversions.slice(-100);
    }

    localStorage.setItem('imageProStats', JSON.stringify(stats));
}

// Track visitor
function trackVisitor() {
    let stats = JSON.parse(localStorage.getItem('imageProStats')) || {};
    
    if (!stats.visitorDates) {
        stats.visitorDates = [];
    }

    const timestamp = new Date().toISOString();
    stats.visitorDates.push(timestamp);

    // Keep only last 1000 visitor records
    if (stats.visitorDates.length > 1000) {
        stats.visitorDates = stats.visitorDates.slice(-1000);
    }

    localStorage.setItem('imageProStats', JSON.stringify(stats));
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Track visitor
    trackVisitor();
    // Set first type as active
    if (document.querySelector('.type-btn')) {
        document.querySelector('.type-btn').classList.add('active');
    }
    
    // Make upload area clickable
    document.getElementById('uploadArea').addEventListener('click', function() {
        document.getElementById('fileInput').click();
    });
    
    // Update threshold value display
    const thresholdSlider = document.getElementById('bgThreshold');
    if (thresholdSlider) {
        thresholdSlider.addEventListener('input', function() {
            document.getElementById('thresholdValue').textContent = this.value;
        });
    }
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});
