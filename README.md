# Kervan 2003 · Ergin Kaplan Net

**Kervan Mahallesi, İstanbul · 2003 tarihli internet kafe atmosferi**

Ergin Kaplan tarafından tasarlanan, tarayıcıda doğrudan oynanabilen 18 özgün mini oyundan oluşan bir oyun salonu. CRT ekran dili, yeşil fosfor, piksel çizimleri, eski internet kafe fiyat panosu ve aynı klavyede iki kişilik oyunlar tek bir sayfada buluşur.

**Salon:** Ergin Kaplan Net  
**Oyun atölyesi:** Ergin Lab  
**Tasarım ve kod:** Ergin Kaplan  
**Dönem:** 2003 atmosferi  
**Oyun sayısı:** 20

**Oyna:** https://eerrgin.github.io/ergin-kaplan-net/

## Oyun kataloğu

### Ergin Lab
- **Yıldız Koridoru** · Uzayda uçuş, düşman dalgaları ve bölüm sonu gemisi.
- **Ring Kaplan** · Aynı klavyede iki kişilik mahalle dövüşü.

### Arcade
- **Ergin Yılan** · Çay bardağını topla, duvara çarpma.
- **Tuğla Duvarı** · Raketle tuğlaları kır.
- **Mahalle Tenisi** · Rıza'ya karşı ilk yedi sayı.
- **Kaplan Tank** · Kervan Mahallesi savunma hattı.
- **Gece Vardiyası** · Gece trafiğinde şerit değiştir.
- **Balon Patlat** · 45 saniyede olabildiğince çok balon yakala.
- **Disket Koşusu** · Disketleri koruyarak gece yolunda engellerden kaç.
- **Kaset Ritmi** · A/S/D/F tuşlarıyla dört kanallı ritim oyununu tamamla.

### Zeka
- **Refleks Testi** · Yeşil ışığı bekle, tepki süreni ölç.
- **Nöbet Labirenti** · Dört fişi topla ve çıkışı bul.
- **Mayın Tarlası** · İlk açılış güvenli, bayraklı kareler.
- **Renk Patlat** · Komşu taşları takas ederek üçlü eşleştir.
- **Hafıza Kartları** · Sekiz kart çiftini bul.
- **Lira Yığ** · Aynı değerleri birleştirerek eski lira bakiyesini büyüt.

### Masa
- **Dört Sıra** · Rıza'ya karşı dört taşı hizala.
- **Üç Taş** · X ve O ile kısa bir masa maçı.
- **Dart Ustası** · Beş atışta hedefi tuttur.
- **Penaltı Nöbeti** · Beş penaltıda kaleciyi şaşırt.

## Çalıştırma

Kurulum, derleme, sunucu veya hesap gerekmez. `index.html` dosyasını tarayıcıda açman yeterlidir. GitHub Pages üzerinde de statik dosyalar olarak çalışır.

Dosyalar:
- `index.html` · CRT salonu, oyun listesi ve ekran.
- `salon.js` · Girdi, oyun döngüsü, rekorlar ve salon arayüzü.
- `games-a.js` · İlk dokuz oyun.
- `games-b.js` · 10–18 numaralı oyunlar.
- `games-c.js` · Disket Koşusu ve Kaset Ritmi.

Dosyaları aynı dizinde tut. Kişisel rekorlar tarayıcının `localStorage` alanında saklanır; başka bir sunucuya gönderilmez. Sesler Web Audio API ile anlık üretilir.

## Teknik ve içerik notu

Oyun mantıkları, piksel görselleri ve ses efektleri bu proje için özgün biçimde yazılmıştır. Oyun görselleri canvas üzerinde çizilir; harici görsel, müzik, oyun ROM'u, üçüncü taraf oyun motoru veya uzaktaki çalışma zamanı kütüphanesi yüklenmez. Proje ağ bağlantısı olmadan da çalışacak şekilde hazırlanmıştır.

Bu açıklama hukuki riskin sıfır olduğunu garanti etmez. Oyuncu adı, marka, karakter, görsel veya müzik gibi üçüncü taraf unsurlar eklenmeden özgün içerikle sınırlandırılmıştır. Yeni içerik eklerken kullanılan her varlığın lisansını ayrıca kontrol et.

## Hak sahipliği

© Ergin Kaplan · Ergin Kaplan Net · Ergin Lab

Bu depo **UNLICENSED** olarak yayımlanır. Kaynak kod ve özgün içerik için ayrıca yazılı izin verilmedikçe kopyalama, dağıtma, satma, değiştirme ve ticari kullanım izni verilmez. Eğitim amaçlı inceleme, bu hakları devretmez.
