# 🎨 آیکون‌ها و Branding

## 📁 فایل‌های مورد نیاز

برای build کردن Desktop App نیاز به این آیکون‌ها دارید:

### Windows
- `electron/icon.png` - 512x512px PNG

### macOS
- `electron/icon.png` - 512x512px PNG

### Linux
- `electron/icon.png` - 512x512px PNG

### System Tray
- `electron/tray-icon.png` - 16x16px PNG

---

## 🎨 راهنمای ساخت آیکون

### روش 1: استفاده از Kubernetes Logo

1. دانلود Kubernetes logo:
   - https://kubernetes.io/images/kubernetes-horizontal-color.png

2. استفاده از tool آنلاین:
   - https://icon.kitchen
   - آپلود لوگو
   - تنظیم سایز 512x512
   - دانلود PNG

### روش 2: طراحی سفارشی

**ایده‌های طراحی:**

```
┌─────────────────┐
│                 │
│   ⎈  K8s        │  
│   Platform      │
│                 │
└─────────────────┘
```

**رنگ‌های پیشنهادی:**
- آبی Kubernetes: `#326CE5`
- سفید: `#FFFFFF`
- خاکستری: `#6B7280`

**ابزارهای طراحی:**
- Figma (رایگان): https://figma.com
- Canva (رایگان): https://canva.com
- GIMP (رایگان): https://gimp.org

### روش 3: استفاده از emoji (سریع!)

برای تست سریع:

```bash
# استفاده از emoji به عنوان آیکون
# ⎈ (Kubernetes symbol)
# 📦 (Package)
# 🚀 (Rocket)
```

---

## 🛠️ ساخت آیکون‌ها

### با ImageMagick

```bash
# نصب ImageMagick
# Windows: choco install imagemagick
# macOS: brew install imagemagick
# Linux: sudo apt install imagemagick

# تبدیل به سایزهای مختلف
convert icon.png -resize 512x512 electron/icon.png
convert icon.png -resize 16x16 electron/tray-icon.png
convert icon.png -resize 256x256 electron/icon-256.png
convert icon.png -resize 128x128 electron/icon-128.png
```

---

## 📌 موقت: آیکون‌های پیش‌فرض

تا آیکون سفارشی بسازید، می‌توانید از این استفاده کنید:

1. یک square آبی با متن "K8s"
2. یا لوگوی Kubernetes
3. یا emoji ⎈

---

## ✅ Checklist

قبل از build:

- [ ] `electron/icon.png` (512x512) موجود است
- [ ] `electron/tray-icon.png` (16x16) موجود است
- [ ] آیکون‌ها شفاف (transparent) هستند
- [ ] فرمت PNG است
- [ ] کیفیت بالا دارند

---

**نکته:** اگر آیکون ندارید، electron-builder خودکار یک آیکون پیش‌فرض استفاده می‌کند.
