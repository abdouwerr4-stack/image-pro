// Dashboard Statistics Manager

// Initialize Lucide icons
document.addEventListener('DOMContentLoaded', function() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    loadStats();
    updateDashboard();
    
    // Update every 5 seconds
    setInterval(updateDashboard, 5000);
});

// Load or create stats
function loadStats() {
    const today = new Date().toDateString();
    let stats = JSON.parse(localStorage.getItem('imageProStats')) || {};
    
    // Reset if it's a new day
    if (stats.lastDate !== today) {
        stats = {
            lastDate: today,
            visitorsToday: Math.floor(Math.random() * 500) + 50,
            totalVisitors: parseInt(localStorage.getItem('totalVisitors')) || 0,
            imagesConverted: 0,
            conversionsByType: {
                'jpg-png': Math.floor(Math.random() * 100) + 20,
                'png-jpg': Math.floor(Math.random() * 80) + 15,
                'webp-png': Math.floor(Math.random() * 40) + 5,
                'gif-png': Math.floor(Math.random() * 30) + 3
            },
            activeUsers: Math.floor(Math.random() * 50) + 5,
            sessionStart: new Date().getTime()
        };
    }
    
    // Increment visitors
    stats.totalVisitors = (stats.totalVisitors || 0) + 1;
    stats.visitorsToday = (stats.visitorsToday || 0) + 1;
    stats.activeUsers = Math.floor(Math.random() * 100) + 10;
    
    localStorage.setItem('imageProStats', JSON.stringify(stats));
    localStorage.setItem('totalVisitors', stats.totalVisitors);
    
    return stats;
}

// Update dashboard display
function updateDashboard() {
    const stats = JSON.parse(localStorage.getItem('imageProStats')) || {};
    
    // Update visitor stats
    document.getElementById('visitorsToday').textContent = stats.visitorsToday || 0;
    document.getElementById('visitorsChange').textContent = '↑ ' + (stats.totalVisitors || 1) + ' زائر إجمالي';
    
    // Update conversion stats
    const totalConversions = Object.values(stats.conversionsByType || {}).reduce((a, b) => a + b, 0);
    document.getElementById('imagesConverted').textContent = totalConversions;
    document.getElementById('conversionChange').textContent = 'تحويلات اليوم: ' + totalConversions;
    
    // Update active users
    document.getElementById('activeUsers').textContent = stats.activeUsers || 0;
    document.getElementById('activityStatus').textContent = 'نشطاء الآن';
    
    // Update conversion charts
    updateConversionCharts(stats.conversionsByType || {});
    
    // Update last update time
    const now = new Date();
    document.getElementById('lastUpdate').textContent = now.toLocaleTimeString('ar-SA');
}

// Update conversion type charts
function updateConversionCharts(conversions) {
    const types = ['jpg-png', 'png-jpg', 'webp-png', 'gif-png'];
    const total = Object.values(conversions).reduce((a, b) => a + b, 0) || 1;
    
    types.forEach((type, index) => {
        const count = conversions[type] || 0;
        const percentage = (count / total) * 100;
        
        document.getElementById('chart' + (index + 1)).style.width = percentage + '%';
        document.getElementById('count' + (index + 1)).textContent = count;
    });
}

// Record a conversion
function recordConversion(type) {
    let stats = JSON.parse(localStorage.getItem('imageProStats')) || {};
    
    if (!stats.conversionsByType) {
        stats.conversionsByType = {};
    }
    
    stats.conversionsByType[type] = (stats.conversionsByType[type] || 0) + 1;
    
    localStorage.setItem('imageProStats', JSON.stringify(stats));
    updateDashboard();
}

// Reset statistics
function resetStats() {
    if (confirm('هل تريد فعلاً مسح جميع الإحصائيات؟')) {
        localStorage.removeItem('imageProStats');
        localStorage.removeItem('totalVisitors');
        location.reload();
    }
}
