// Background Service Worker - Arka planda çalışır

console.log('🎫 Coupon Finder Pro Background Script başlatıldı');

// Extension kurulduğunda
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('Extension ilk kez kuruldu');
        initializeExtension();
    } else if (details.reason === 'update') {
        console.log('Extension güncellendi');
    }
});

// Extension'ı başlat
async function initializeExtension() {
    // Varsayılan ayarları kaydet
    await chrome.storage.sync.set({
        autoApply: true,
        totalSavings: 0,
        couponsUsed: 0,
        usedCoupons: [],
        notificationsEnabled: true
    });

    // Hoş geldin sayfasını aç
    chrome.tabs.create({
        url: chrome.runtime.getURL('welcome.html')
    });

    console.log('Extension başlatıldı ve varsayılan ayarlar kaydedildi');
}

// Mesajları dinle
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background mesaj alındı:', request);

    if (request.action === 'couponFieldDetected') {
        // Kupon alanı tespit edildi
        handleCouponFieldDetected(sender.tab.id);
        sendResponse({ success: true });
    } else if (request.action === 'updateBadge') {
        // Badge güncelle
        updateBadge(request.count, sender.tab.id);
        sendResponse({ success: true });
    } else if (request.action === 'getCoupons') {
        // Kuponları al (API'den)
        getCouponsForSite(request.url).then(coupons => {
            sendResponse({ coupons });
        });
        return true; // Async response
    }

    return true;
});

// Tab değiştiğinde
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url) {
        checkSiteForCoupons(tab.url, tab.id);
    }
});

// Tab güncellendiğinde
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        checkSiteForCoupons(tab.url, tabId);
    }
});

// Site için kupon kontrolü
async function checkSiteForCoupons(url, tabId) {
    try {
        const hostname = new URL(url).hostname.replace('www.', '');

        // Desteklenen siteler
        const supportedSites = [
            'trendyol.com',
            'hepsiburada.com',
            'n11.com',
            'gittigidiyor.com',
            'amazon.com.tr',
            'amazon.com'
        ];

        const isSupported = supportedSites.some(site => hostname.includes(site));

        if (isSupported) {
            // Kupon sayısını badge'de göster
            const couponCount = await getCouponCount(hostname);
            updateBadge(couponCount, tabId);
        } else {
            // Badge'i temizle
            updateBadge(0, tabId);
        }
    } catch (error) {
        console.error('Site kontrolü hatası:', error);
    }
}

// Kupon sayısını al
async function getCouponCount(hostname) {
    // Gerçek uygulamada API'den gelir
    const couponCounts = {
        'trendyol.com': 3,
        'hepsiburada.com': 2,
        'n11.com': 2,
        'amazon.com.tr': 1
    };

    const site = Object.keys(couponCounts).find(s => hostname.includes(s));
    return site ? couponCounts[site] : 0;
}

// Badge güncelle
function updateBadge(count, tabId) {
    if (count > 0) {
        chrome.action.setBadgeText({
            text: count.toString(),
            tabId: tabId
        });

        chrome.action.setBadgeBackgroundColor({
            color: '#10b981',
            tabId: tabId
        });

        chrome.action.setTitle({
            title: `${count} kupon mevcut!`,
            tabId: tabId
        });
    } else {
        chrome.action.setBadgeText({
            text: '',
            tabId: tabId
        });

        chrome.action.setTitle({
            title: 'Coupon Finder Pro',
            tabId: tabId
        });
    }
}

// Kupon alanı tespit edildiğinde
function handleCouponFieldDetected(tabId) {
    console.log('Kupon alanı tespit edildi:', tabId);

    // Badge'e özel işaret ekle
    chrome.action.setBadgeBackgroundColor({
        color: '#667eea',
        tabId: tabId
    });
}

// Site için kuponları al (API)
async function getCouponsForSite(url) {
    // Gerçek uygulamada API'den kupon verileri çekilir
    // Örnek API endpoint: https://api.couponfinder.com/v1/coupons?site=trendyol.com

    console.log('Kuponlar alınıyor:', url);

    // Simüle edilmiş API response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    code: 'EXAMPLE50',
                    discount: '₺50',
                    description: 'Örnek kupon kodu',
                    expiry: '31 Ara 2026',
                    verified: true
                }
            ]);
        }, 500);
    });
}

// Periyodik kupon güncelleme (Her 6 saatte bir)
chrome.alarms.create('updateCoupons', {
    periodInMinutes: 360 // 6 saat
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'updateCoupons') {
        console.log('Kuponlar güncelleniyor...');
        updateAllCoupons();
    }
});

// Tüm kuponları güncelle
async function updateAllCoupons() {
    console.log('Kupon veritabanı güncelleniyor...');

    try {
        // API'den güncel kuponları çek
        // const response = await fetch('https://api.couponfinder.com/v1/coupons/update');
        // const data = await response.json();

        // Chrome storage'a kaydet
        // await chrome.storage.local.set({ coupons: data.coupons });

        console.log('Kuponlar güncellendi');
    } catch (error) {
        console.error('Kupon güncelleme hatası:', error);
    }
}

// İstatistikleri sıfırla (Ayarlardan çağrılabilir)
async function resetStats() {
    await chrome.storage.sync.set({
        totalSavings: 0,
        couponsUsed: 0,
        usedCoupons: []
    });
    console.log('İstatistikler sıfırlandı');
}

// Context Menu oluştur
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'findCoupons',
        title: 'Bu site için kupon bul',
        contexts: ['page']
    });

    chrome.contextMenus.create({
        id: 'copyCoupon',
        title: 'Kupon kodunu kopyala',
        contexts: ['selection']
    });
});

// Context Menu tıklamaları
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'findCoupons') {
        // Popup'ı aç
        chrome.action.openPopup();
    } else if (info.menuItemId === 'copyCoupon') {
        // Seçili metni kupon olarak kopyala
        const couponCode = info.selectionText.trim();
        await chrome.tabs.sendMessage(tab.id, {
            action: 'applyCoupon',
            code: couponCode
        });
    }
});

// Extension icon'a tıklandığında (kısayol)
chrome.action.onClicked.addListener((tab) => {
    console.log('Extension icon tıklandı:', tab.url);
});

// Bildirim gönder (Opsiyonel)
async function sendNotification(title, message) {
    const settings = await chrome.storage.sync.get('notificationsEnabled');

    if (settings.notificationsEnabled) {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: title,
            message: message,
            priority: 2
        });
    }
}
