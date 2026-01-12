// Content Script - Web sayfasına enjekte edilir
console.log('🎫 Coupon Finder Pro aktif!');

// Popup'tan gelen mesajları dinle
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'applyCoupon') {
        applyCouponToPage(request.code);
        sendResponse({ success: true });
    } else if (request.action === 'testCoupon') {
        testCouponCode(request.code);
        sendResponse({ success: true });
    }
    return true;
});

// Kupon kodunu sayfaya uygula
function applyCouponToPage(couponCode) {
    // Kupon input alanını bul (çeşitli selektörler)
    const couponSelectors = [
        'input[name*="coupon"]',
        'input[name*="promo"]',
        'input[name*="discount"]',
        'input[id*="coupon"]',
        'input[id*="promo"]',
        'input[id*="discount"]',
        'input[placeholder*="kupon"]',
        'input[placeholder*="İndirim"]',
        'input[placeholder*="Promosyon"]',
        'input.coupon',
        'input.promo-code',
        '.coupon-input input',
        '.discount-code input'
    ];

    let couponInput = null;

    // İlk eşleşen input'u bul
    for (const selector of couponSelectors) {
        couponInput = document.querySelector(selector);
        if (couponInput) {
            console.log('Kupon alanı bulundu:', selector);
            break;
        }
    }

    if (couponInput) {
        // Kupon kodunu gir
        couponInput.value = couponCode;
        couponInput.dispatchEvent(new Event('input', { bubbles: true }));
        couponInput.dispatchEvent(new Event('change', { bubbles: true }));

        // "Uygula" butonunu bul ve tıkla
        const applyButtonSelectors = [
            'button[type="submit"]',
            'button[name*="apply"]',
            'button[id*="apply"]',
            'button.apply-coupon',
            'button.btn-apply',
            '.coupon-apply button',
            'input[type="submit"][value*="Uygula"]'
        ];

        let applyButton = null;

        // Input'un yakınındaki butonu bul
        for (const selector of applyButtonSelectors) {
            const buttons = document.querySelectorAll(selector);
            for (const button of buttons) {
                // Eğer buton input'a yakınsa
                if (isNearElement(couponInput, button)) {
                    applyButton = button;
                    break;
                }
            }
            if (applyButton) break;
        }

        if (applyButton) {
            console.log('Uygula butonu bulundu');
            // Kısa bir gecikme ile butona tıkla
            setTimeout(() => {
                applyButton.click();
                showNotification(`✅ ${couponCode} uygulanıyor...`, 'success');
            }, 500);
        } else {
            showNotification(`✓ ${couponCode} koda girildi. Manuel uygulayın.`, 'info');
        }

        // Input'a odaklan
        couponInput.focus();
        couponInput.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Input'u highlight et
        highlightElement(couponInput);
    } else {
        console.log('Kupon alanı bulunamadı');
        showNotification('⚠️ Kupon alanı bulunamadı. Kodu manuel girin.', 'warning');
    }
}

// İki elementin birbirine yakın olup olmadığını kontrol et
function isNearElement(element1, element2, maxDistance = 300) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();

    const distance = Math.sqrt(
        Math.pow(rect1.left - rect2.left, 2) +
        Math.pow(rect1.top - rect2.top, 2)
    );

    return distance < maxDistance;
}

// Elementi vurgula
function highlightElement(element) {
    const originalBorder = element.style.border;
    const originalOutline = element.style.outline;

    element.style.border = '3px solid #667eea';
    element.style.outline = '3px solid rgba(102, 126, 234, 0.3)';
    element.style.transition = 'all 0.3s';

    setTimeout(() => {
        element.style.border = originalBorder;
        element.style.outline = originalOutline;
    }, 2000);
}

// Sayfada bildirim göster
function showNotification(message, type = 'success') {
    // Eski bildirimi kaldır
    const existingNotification = document.getElementById('coupon-finder-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Bildirim oluştur
    const notification = document.createElement('div');
    notification.id = 'coupon-finder-notification';
    notification.className = `coupon-finder-notification ${type}`;
    notification.innerHTML = `
        <div class="coupon-notification-content">
            <div class="coupon-notification-icon">${getNotificationIcon(type)}</div>
            <div class="coupon-notification-text">${message}</div>
            <button class="coupon-notification-close">×</button>
        </div>
    `;

    document.body.appendChild(notification);

    // Kapat butonuna event ekle
    notification.querySelector('.coupon-notification-close').addEventListener('click', () => {
        notification.remove();
    });

    // Otomatik kapat (5 saniye)
    setTimeout(() => {
        if (notification && notification.parentElement) {
            notification.style.animation = 'couponSlideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Bildirim ikonu al
function getNotificationIcon(type) {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    return icons[type] || 'ℹ️';
}

// Kupon kodunu test et
function testCouponCode(couponCode) {
    console.log('Kupon test ediliyor:', couponCode);
    applyCouponToPage(couponCode);

    // Test sonucunu kontrol et (2 saniye sonra)
    setTimeout(() => {
        checkCouponSuccess(couponCode);
    }, 2000);
}

// Kupon başarı durumunu kontrol et
function checkCouponSuccess(couponCode) {
    // Başarı mesajlarını ara
    const successSelectors = [
        '.success',
        '.alert-success',
        '.coupon-success',
        '[class*="success"]',
        '[class*="valid"]'
    ];

    // Hata mesajlarını ara
    const errorSelectors = [
        '.error',
        '.alert-error',
        '.alert-danger',
        '.coupon-error',
        '[class*="error"]',
        '[class*="invalid"]'
    ];

    let isSuccess = false;
    let isError = false;

    // Başarı kontrolü
    for (const selector of successSelectors) {
        const element = document.querySelector(selector);
        if (element && element.offsetParent !== null) {
            // Element görünür mü kontrol et
            const text = element.textContent.toLowerCase();
            if (text.includes('başarı') || text.includes('uygula') || text.includes('success')) {
                isSuccess = true;
                break;
            }
        }
    }

    // Hata kontrolü
    for (const selector of errorSelectors) {
        const element = document.querySelector(selector);
        if (element && element.offsetParent !== null) {
            const text = element.textContent.toLowerCase();
            if (text.includes('hata') || text.includes('geçersiz') || text.includes('error') || text.includes('invalid')) {
                isError = true;
                break;
            }
        }
    }

    // Sonuç bildirimi
    if (isSuccess) {
        showNotification(`🎉 ${couponCode} başarıyla uygulandı!`, 'success');
    } else if (isError) {
        showNotification(`❌ ${couponCode} geçerli değil`, 'error');
    } else {
        showNotification(`ℹ️ ${couponCode} test edildi (Sonuç belirsiz)`, 'info');
    }
}

// Sayfa yüklendiğinde kupon alanlarını tespit et
window.addEventListener('load', () => {
    detectCouponFields();
});

// Kupon alanlarını tespit et
function detectCouponFields() {
    const couponSelectors = [
        'input[name*="coupon"]',
        'input[name*="promo"]',
        'input[id*="coupon"]',
        'input[placeholder*="kupon"]'
    ];

    for (const selector of couponSelectors) {
        const input = document.querySelector(selector);
        if (input) {
            console.log('✅ Kupon alanı tespit edildi!');
            // Extension ikonuna bilgi gönder
            chrome.runtime.sendMessage({
                action: 'couponFieldDetected',
                url: window.location.href
            });
            break;
        }
    }
}
