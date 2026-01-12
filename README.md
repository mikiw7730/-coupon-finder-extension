# 🎫 Coupon Finder Pro - Browser Extension

**Otomatik Kupon Bulucu Chrome & Firefox Eklentisi**

E-ticaret sitelerinde alışveriş yaparken otomatik olarak en iyi kuponları bulun ve uygulayın. Zamandan ve paradan tasarruf edin!

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Chrome](https://img.shields.io/badge/chrome-supported-brightgreen)
![Firefox](https://img.shields.io/badge/firefox-supported-orange)

---

## ✨ Özellikler

- 🔍 **Otomatik Kupon Bulma** - Desteklenen sitelerde otomatik olarak mevcut kuponları bulur
- ⚡ **Tek Tıkla Uygulama** - Kupon kodlarını tek tıkla kopyalar ve uygular
- 📊 **Tasarruf İstatistikleri** - Toplam tasarruf miktarınızı ve kullandığınız kupon sayısını takip edin
- 🎯 **Akıllı Algılama** - Sayfalardaki kupon alanlarını otomatik tespit eder
- ✅ **Doğrulanmış Kuponlar** - Çalıştığı kanıtlanmış kuponları gösterir
- 🔔 **Gerçek Zamanlı Bildirimler** - Kupon uygulandığında anında bildirim
- 🌐 **Çoklu Site Desteği** - Trendyol, Hepsiburada, N11, Amazon ve daha fazlası
- 🎨 **Modern UI** - Kullanıcı dostu ve şık arayüz

---

## 🚀 Kurulum

### Chrome İçin

1. Bu repoyu indirin veya klonlayın:
   ```bash
   git clone https://github.com/yourusername/coupon-finder-extension.git
   ```

2. Chrome tarayıcınızı açın ve adres çubuğuna yazın:
   ```
   chrome://extensions/
   ```

3. Sağ üstteki **"Geliştirici modu"** seçeneğini aktif edin

4. **"Paketlenmemiş öğe yükle"** butonuna tıklayın

5. İndirdiğiniz `coupon-finder-extension` klasörünü seçin

6. Extension başarıyla yüklendi! 🎉

### Firefox İçin

1. Bu repoyu indirin veya klonlayın

2. Firefox tarayıcınızı açın ve adres çubuğuna yazın:
   ```
   about:debugging#/runtime/this-firefox
   ```

3. **"Geçici Eklenti Yükle"** butonuna tıklayın

4. `coupon-finder-extension` klasöründeki `manifest.json` dosyasını seçin

5. Extension başarıyla yüklendi! 🎉

---

## 📖 Kullanım

### Temel Kullanım

1. Desteklenen bir e-ticaret sitesine gidin (örn: Trendyol, Hepsiburada)

2. Extension ikonu üzerine gelin - mevcut kupon sayısını göreceksiniz

3. Extension ikonuna tıklayarak popup'ı açın

4. Mevcut kuponları görün ve istediğiniz kupona tıklayın

5. Kupon otomatik olarak kopyalanır ve mümkünse sayfaya uygulanır

### Otomatik Mod

- **Otomatik Uygula** seçeneği açıksa, extension mevcut kuponları otomatik olarak test eder
- En iyi kuponu bulduğunda otomatik olarak uygular
- Bu özelliği popup'tan açıp kapatabilirsiniz

### Kısayollar

- **Sağ Tık Menüsü**: Sayfada sağ tıklayarak "Bu site için kupon bul" seçeneğini kullanın
- **Metin Seçimi**: Bir kupon kodu seçin, sağ tıklayın ve "Kupon kodunu kopyala" seçin

---

## 🏪 Desteklenen Siteler

✅ **Türkiye:**
- Trendyol
- Hepsiburada
- N11
- GittiGidiyor
- Amazon TR

✅ **Uluslararası:**
- Amazon.com
- (Daha fazla site eklenecek)

---

## 📁 Dosya Yapısı

```
coupon-finder-extension/
├── manifest.json          # Extension yapılandırması
├── popup.html            # Extension popup UI
├── popup.css             # Popup stilleri
├── popup.js              # Popup mantığı
├── content.js            # Web sayfası entegrasyonu
├── content.css           # Sayfa içi bildirim stilleri
├── background.js         # Arka plan service worker
├── README.md             # Bu dosya
└── icons/
    ├── icon16.png        # 16x16 ikon
    ├── icon48.png        # 48x48 ikon
    └── icon128.png       # 128x128 ikon
```

---

## 🛠️ Geliştirme

### Gereksinimler

- Chrome 88+ veya Firefox 90+
- Temel HTML, CSS, JavaScript bilgisi

### Yeni Site Eklemek

`popup.js` dosyasındaki `COUPON_DATABASE` objesine yeni site ekleyin:

```javascript
const COUPON_DATABASE = {
    'yenisite.com': [
        {
            code: 'KUPONKODU',
            discount: '%20',
            description: 'Açıklama',
            expiry: '31 Ara 2026',
            verified: true
        }
    ]
};
```

### API Entegrasyonu

Gerçek bir uygulamada kuponlar bir API'den çekilmelidir:

```javascript
// popup.js içinde
async function getCouponsFromAPI(site) {
    const response = await fetch(`https://api.example.com/coupons?site=${site}`);
    const data = await response.json();
    return data.coupons;
}
```

---

## 🎨 Özelleştirme

### Renkleri Değiştirme

`popup.css` dosyasında ana gradient renklerini değiştirebilirsiniz:

```css
/* Ana renk */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Diğer renkler */
#10b981  /* Yeşil - Başarı */
#ef4444  /* Kırmızı - Hata */
#f59e0b  /* Turuncu - Uyarı */
```

### Icon Değiştirme

`icons/` klasöründeki PNG dosyalarını değiştirin:
- icon16.png (16x16px)
- icon48.png (48x48px)
- icon128.png (128x128px)

---

## 🔐 Gizlilik

- Extension herhangi bir kişisel veri toplamaz
- Tüm veriler yerel olarak tarayıcınızda saklanır
- Üçüncü parti sunuculara veri gönderilmez
- Açık kaynak kodludur, kodu inceleyebilirsiniz

---

## 🐛 Sorun Giderme

### Extension çalışmıyor

1. Extension'ın aktif olduğundan emin olun
2. Sayfayı yenileyin (F5)
3. Extension'ı kaldırıp tekrar yükleyin
4. Tarayıcı konsolunda hata mesajlarını kontrol edin

### Kuponlar gösterilmiyor

1. Desteklenen bir sitede olduğunuzdan emin olun
2. Extension popup'ını açıp kapatın
3. Sayfayı yenileyin

### Kupon uygulanamıyor

1. Ödeme/sepet sayfasında olduğunuzdan emin olun
2. Kupon alanının görünür olduğunu kontrol edin
3. Manuel olarak kuponu kopyalayıp yapıştırın

---

## 📝 Yapılacaklar (Roadmap)

- [ ] Daha fazla e-ticaret sitesi desteği
- [ ] Kupon başarı oranı istatistikleri
- [ ] Favori kuponlar özelliği
- [ ] Cashback entegrasyonu
- [ ] Fiyat takip özelliği
- [ ] Karanlık tema
- [ ] Çoklu dil desteği
- [ ] Chrome Web Store'da yayınlama
- [ ] Firefox Add-ons'da yayınlama

---

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen şu adımları izleyin:

1. Bu repoyu fork edin
2. Feature branch oluşturun (`git checkout -b feature/YeniOzellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'Yeni özellik eklendi'`)
4. Branch'inizi push edin (`git push origin feature/YeniOzellik`)
5. Pull Request oluşturun

---

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

## 📧 İletişim

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com
- Website: https://yourwebsite.com

---

## ⭐ Destekleyin

Eğer bu projeyi beğendiyseniz:
- ⭐ GitHub'da yıldız verin
- 🐛 Bug bildirin
- 💡 Yeni özellik önerin
- 🔄 Projeyi paylaşın

---

## 🙏 Teşekkürler

Bu extension'ı kullandığınız için teşekkürler! Alışverişte tasarruf etmenizi umuyoruz. 💰

---

**Made with ❤️ by Coupon Finder Pro Team**

