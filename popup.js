// Kupon Veritabanı (Gerçek uygulamada API'den gelir)
const COUPON_DATABASE = {
    'trendyol.com': [
        {
            code: 'YENI50',
            discount: '%15',
            description: 'İlk alışverişinizde 150 TL üzeri',
            expiry: '31 Ara 2026',
            verified: true
        },
        {
            code: 'KARGO0',
            discount: 'Ücretsiz Kargo',
            description: 'Tüm ürünlerde geçerli',
            expiry: '15 Oca 2026',
            verified: true
        },
        {
            code: 'FLASH100',
            discount: '₺100',
            description: '500 TL üzeri alışverişlerde',
            expiry: '20 Oca 2026',
            verified: false
        }
    ],
    'hepsiburada.com': [
        {
            code: 'EXTRA20',
            discount: '%20',
            description: 'Elektronik kategorisinde',
            expiry: '28 Oca 2026',
            verified: true
        },
        {
            code: 'HB200',
            discount: '₺200',
            description: '1000 TL üzeri alışverişte',
            expiry: '31 Oca 2026',
            verified: true
        }
    ],
    'n11.com': [
        {
            code: 'YENIYIL',
            discount: '%25',
            description: 'Tüm kategorilerde geçerli',
            expiry: '31 Oca 2026',
            verified: true
        },
        {
            code: 'N11INDIRIM',
            discount: '₺50',
            description: '300 TL ve üzeri',
            expiry: '15 Oca 2026',
            verified: false
        }
    ],
    'amazon.com.tr': [
        {
            code: 'PRIME15',
            discount: '%15',
            description: 'Prime üyelere özel',
            expiry: '31 Oca 2026',
            verified: true
        }
    ]
};

// DOM Elementleri
let currentUrlElement, couponsList, couponCountElement, noCouponsElement;
let totalSavingsElement, couponsUsedElement, autoApplyToggle;
let loadingOverlay, siteStatus;

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', async () => {
    initializeElements();
    await loadStats();
    await checkCurrentSite();
    setupEventListeners();
});

// DOM elementlerini başlat
function initializeElements() {
    currentUrlElement = document.getElementById('currentUrl');
    couponsList = document.getElementById('couponsList');
    couponCountElement = document.getElementById('couponCount');
    noCouponsElement = document.getElementById('noCoupons');
    totalSavingsElement = document.getElementById('totalSavings');
    couponsUsedElement = document.getElementById('couponsUsed');
    autoApplyToggle = document.getElementById('autoApplyToggle');
    loadingOverlay = document.getElementById('loadingOverlay');
    siteStatus = document.getElementById('siteStatus');
}

// Event listener'ları kur
function setupEventListeners() {
    // Ayarlar butonu
    document.getElementById('settingsBtn').addEventListener('click', () => {
        showMessage('Ayarlar yakında gelecek!', 'success');
    });

    // Hakkında butonu
    document.getElementById('aboutBtn').addEventListener('click', () => {
        showMessage('Coupon Finder Pro v1.0 - Alışverişte tasarruf edin!', 'success');
    });

    // Otomatik uygulama toggle
    autoApplyToggle.addEventListener('change', async (e) => {
        await chrome.storage.sync.set({ autoApply: e.target.checked });
        showMessage(
            e.target.checked ? 'Otomatik uygulama açıldı' : 'Otomatik uygulama kapatıldı',
            'success'
        );
    });
}

// Mevcut siteyi kontrol et
async function checkCurrentSite() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab || !tab.url) {
            updateSiteStatus('Geçersiz site', '', false);
            return;
        }

        const url = new URL(tab.url);
        const hostname = url.hostname.replace('www.', '');

        currentUrlElement.textContent = hostname;

        // Desteklenen sitemi kontrol et
        const supportedSite = Object.keys(COUPON_DATABASE).find(site =>
            hostname.includes(site)
        );

        if (supportedSite) {
            updateSiteStatus('Kuponlar bulundu!', hostname, true);
            displayCoupons(COUPON_DATABASE[supportedSite], tab.id);
        } else {
            updateSiteStatus('Bu site desteklenmiyor', hostname, false);
            showNoCoupons();
        }
    } catch (error) {
        console.error('Site kontrolü hatası:', error);
        updateSiteStatus('Hata oluştu', '', false);
        showNoCoupons();
    }
}

// Site durumunu güncelle
function updateSiteStatus(title, url, success) {
    const statusIcon = siteStatus.querySelector('.status-icon');
    const statusTitle = siteStatus.querySelector('.status-title');

    statusTitle.textContent = title;
    statusIcon.textContent = success ? '✅' : '❌';

    if (success) {
        siteStatus.style.background = 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)';
    } else {
        siteStatus.style.background = 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)';
    }
}

// Kuponları göster
function displayCoupons(coupons, tabId) {
    couponsList.innerHTML = '';
    couponCountElement.textContent = coupons.length;

    if (coupons.length === 0) {
        showNoCoupons();
        return;
    }

    noCouponsElement.style.display = 'none';
    couponsList.style.display = 'flex';

    coupons.forEach(coupon => {
        const couponCard = createCouponCard(coupon, tabId);
        couponsList.appendChild(couponCard);
    });
}

// Kupon kartı oluştur
function createCouponCard(coupon, tabId) {
    const card = document.createElement('div');
    card.className = 'coupon-card';

    card.innerHTML = `
        <div class="coupon-header">
            <div class="coupon-code">${coupon.code}</div>
            <div class="coupon-discount">${coupon.discount}</div>
        </div>
        <div class="coupon-description">${coupon.description}</div>
        <div class="coupon-footer">
            <div class="coupon-expiry">⏰ ${coupon.expiry}</div>
            <div class="coupon-verified">
                ${coupon.verified ? '✓ Doğrulanmış' : '⚠️ Test edilmemiş'}
            </div>
        </div>
    `;

    // Kupon kartına tıklandığında kopyala
    card.addEventListener('click', async () => {
        await copyCouponCode(coupon.code, tabId);
    });

    return card;
}

// Kupon kodunu kopyala ve uygula
async function copyCouponCode(code, tabId) {
    try {
        // Kodu panoya kopyala
        await navigator.clipboard.writeText(code);

        // Başarı mesajı göster
        showMessage(`✅ ${code} kopyalandı!`, 'success');

        // Content script'e kupon kodunu gönder
        try {
            await chrome.tabs.sendMessage(tabId, {
                action: 'applyCoupon',
                code: code
            });
        } catch (error) {
            console.log('Content script iletişim hatası:', error);
        }

        // İstatistikleri güncelle
        await updateStats(code);
    } catch (error) {
        console.error('Kopyalama hatası:', error);
        showMessage('❌ Kopyalama başarısız!', 'error');
    }
}

// Kupon yok mesajını göster
function showNoCoupons() {
    couponsList.style.display = 'none';
    noCouponsElement.style.display = 'block';
    couponCountElement.textContent = '0';
}

// İstatistikleri yükle
async function loadStats() {
    try {
        const result = await chrome.storage.sync.get(['totalSavings', 'couponsUsed', 'autoApply']);

        totalSavingsElement.textContent = `₺${result.totalSavings || 0}`;
        couponsUsedElement.textContent = result.couponsUsed || 0;
        autoApplyToggle.checked = result.autoApply !== false; // Varsayılan true
    } catch (error) {
        console.error('İstatistik yükleme hatası:', error);
    }
}

// İstatistikleri güncelle
async function updateStats(couponCode) {
    try {
        const result = await chrome.storage.sync.get(['couponsUsed', 'usedCoupons']);

        const couponsUsed = (result.couponsUsed || 0) + 1;
        const usedCoupons = result.usedCoupons || [];

        // Aynı kuponu tekrar saymamak için kontrol et
        if (!usedCoupons.includes(couponCode)) {
            usedCoupons.push(couponCode);

            await chrome.storage.sync.set({
                couponsUsed: couponsUsed,
                usedCoupons: usedCoupons
            });

            couponsUsedElement.textContent = couponsUsed;
        }
    } catch (error) {
        console.error('İstatistik güncelleme hatası:', error);
    }
}

// Mesaj göster
function showMessage(text, type) {
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;

    document.body.appendChild(message);

    setTimeout(() => {
        message.style.animation = 'slideDown 0.3s ease reverse';
        setTimeout(() => message.remove(), 300);
    }, 3000);
}

// Yükleme göster/gizle
function showLoading(show) {
    loadingOverlay.style.display = show ? 'flex' : 'none';
}

// Test modu - Kuponları otomatik test et
async function autoTestCoupons(coupons, tabId) {
    showLoading(true);

    for (const coupon of coupons) {
        // Her kuponu test et
        await chrome.tabs.sendMessage(tabId, {
            action: 'testCoupon',
            code: coupon.code
        });

        // Sonraki kupon için bekle
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    showLoading(false);
    showMessage('Tüm kuponlar test edildi!', 'success');
}
