# راهنمای ساخت Release

این راهنما نحوه ساخت خودکار Release برای اپلیکیشن دسکتاپ را توضیح می‌دهد.

## 🚀 نحوه کار

وقتی یک **tag** با الگوی `v*` بسازید (مثلاً `v1.0.0`)، GitHub Actions خودکار:

1. ✅ روی **Windows**, **macOS** و **Linux** build می‌گیرد
2. ✅ فایل‌های نصبی رو می‌سازه:
   - Windows: `.exe` (NSIS installer)
   - macOS: `.dmg`
   - Linux: `.AppImage` و `.deb`
3. ✅ یک **GitHub Release** می‌سازه
4. ✅ تمام فایل‌ها رو به Release آپلود می‌کنه
5. ✅ Release notes خودکار می‌سازه

## 📋 مراحل ساخت Release

### گام 1: تغییرات رو commit کن
```powershell
git add .
git commit -m "feat: desktop app with auto-credentials and service controls"
```

### گام 2: Push به GitHub
```powershell
git push origin main
```

### گام 3: یک Version Tag بساز
```powershell
# تگ با توضیحات
git tag -a v1.0.0 -m "First stable release - Desktop app with Electron"

# پوش کردن تگ به GitHub (این باعث trigger شدن workflow میشه!)
git push origin v1.0.0
```

### گام 4: منتظر بمون! 🎉

GitHub Actions خودکار شروع می‌کنه و حدود **15-20 دقیقه** طول می‌کشه.

پیشرفت رو می‌تونی ببینی:
```
https://github.com/YOUR_USERNAME/k8s-platform-panel/actions
```

## 📦 چی ساخته میشه؟

بعد از اتمام، Release رو توی این آدرس پیدا می‌کنی:
```
https://github.com/YOUR_USERNAME/k8s-platform-panel/releases
```

### فایل‌های ساخته شده:

#### Windows (حدود 80-100 MB):
```
K8s-Platform-Manager-Setup-1.0.0.exe
```

#### macOS (حدود 100-120 MB):
```
K8s-Platform-Manager-1.0.0.dmg
```

#### Linux:
```
K8s-Platform-Manager-1.0.0.AppImage  (حدود 90 MB)
k8s-platform-manager_1.0.0_amd64.deb  (حدود 60 MB)
```

## 🔄 ساخت Release جدید

برای نسخه‌های بعدی:

```powershell
# نسخه 1.1.0
git tag -a v1.1.0 -m "Added new features"
git push origin v1.1.0

# نسخه 2.0.0
git tag -a v2.0.0 -m "Major update"
git push origin v2.0.0
```

## 🛠️ Build دستی (بدون GitHub Actions)

اگه خودت می‌خوای local build بگیری:

```powershell
# نصب dependencies
npm install

# Build برای Windows
npm run electron:build:win

# Build برای تمام پلتفرم‌ها
npm run electron:build
```

فایل‌ها توی `dist-electron/` ساخته میشن.

## 📝 Version Naming

از **Semantic Versioning** استفاده کن:

- **v1.0.0**: اولین نسخه stable
- **v1.0.1**: bug fix
- **v1.1.0**: ویژگی جدید (minor update)
- **v2.0.0**: تغییرات بزرگ (major update)

مثال:
```powershell
git tag -a v1.0.1 -m "Fixed deployment credentials display bug"
git tag -a v1.1.0 -m "Added support for PostgreSQL and Redis apps"
git tag -a v2.0.0 -m "Complete UI redesign"
```

## 🔍 مشاهده Logs

اگه build خطا داد:

1. برو به Actions tab: `https://github.com/YOUR_USERNAME/k8s-platform-panel/actions`
2. روی workflow run کلیک کن
3. هر job (Windows, macOS, Linux) رو بررسی کن
4. لاگ‌های خطا رو بخون

## ✅ Checklist قبل از Release

قبل از ساخت هر Release:

- [ ] تست کردی که اپ درست کار می‌کنه؟
- [ ] `package.json` رو آپدیت کردی؟ (version field)
- [ ] CHANGELOG رو نوشتی؟
- [ ] مستندات رو آپدیت کردی؟
- [ ] Icon‌های اپلیکیشن رو ساختی؟ (electron/icon.png)
- [ ] تغییرات رو commit کردی؟
- [ ] به main branch پوش کردی؟

## 🎯 مثال کامل

```powershell
# 1. آپدیت version در package.json
# "version": "1.0.0" → "1.1.0"

# 2. Commit تغییرات
git add .
git commit -m "chore: bump version to 1.1.0"

# 3. Push کن
git push origin main

# 4. تگ بساز
git tag -a v1.1.0 -m "Release v1.1.0 - Added PostgreSQL support"

# 5. تگ رو پوش کن (این باعث build میشه!)
git push origin v1.1.0

# 6. برو به GitHub Actions و تماشا کن! 🍿
# https://github.com/YOUR_USERNAME/k8s-platform-panel/actions
```

## 🚨 نکات مهم

1. **فقط از main branch** تگ بزن
2. **همیشه قبل از تگ** تغییرات رو push کن
3. **نام تگ باید با v شروع بشه** (مثل v1.0.0)
4. **توی package.json** هم version رو آپدیت کن
5. **Icon‌ها رو حتماً بساز** وگرنه icon پیش‌فرض Electron استفاده میشه

## 📚 منابع

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [electron-builder Documentation](https://www.electron.build/)
- [Semantic Versioning](https://semver.org/)
