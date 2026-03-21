// تحقق من الاشتراك
function checkSubscription(featureType = 'advanced') {
    const subscriptions = JSON.parse(localStorage.getItem('userSubscriptions') || '{}');
    
    return {
        isPremium: !!subscriptions.premium,
        isPro: !!subscriptions.pro,
        hasFeature: function(type) {
            if (type === 'advanced') return this.isPremium;
            if (type === 'pro') return this.isPro;
            return false;
        }
    };
}

// عرض رسالة الترقية
function showUpgradeModal() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 40px; border-radius: 16px; max-width: 400px; direction: rtl; text-align: right;">
            <h2 style="margin-bottom: 20px; color: #333;">🔐 هذه الميزة حصرية</h2>
            <p style="color: #666; margin-bottom: 20px;">هذه الميزة متاحة فقط للمشتركين في خطة البريميوم أو البروفشنال.</p>
            <div style="display: flex; gap: 10px;">
                <button onclick="window.location.href='pricing.html'" style="flex: 1; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    الترقية الآن
                </button>
                <button onclick="this.closest('div').parentElement.remove()" style="flex: 1; background: #f0f0f0; border: none; padding: 12px; border-radius: 8px; cursor: pointer; color: #333; font-weight: 600;">
                    إغلاق
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// مثال على الاستخدام في script.js:
// if (!checkSubscription().isPremium) {
//     showUpgradeModal();
//     return;
// }
