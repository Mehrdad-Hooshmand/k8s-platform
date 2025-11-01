# 🚀 Quick Start - ساخت اولین Release

## برای عجله‌ای‌ها! ⚡

### آماده‌سازی (یکبار اول)

```powershell
# 1. مطمئن شو Git نصب شده
git --version

# 2. اگه اولین بار Git استفاده می‌کنی:
git config --global user.name "Your Name"
git config --global user.email "your.email@gmail.com"

# 3. یه Repository خالی توی GitHub بساز:
# https://github.com/new
# اسم: k8s-platform-panel
```

### ساخت Release (خیلی ساده!)

#### 🪟 Windows:
```powershell
cd C:\home\k8s-platform-panel
.\quick-release.ps1
```

#### 🐧 Linux/Mac:
```bash
cd ~/k8s-platform-panel
chmod +x quick-release.sh
./quick-release.sh
```

اسکریپت از تو می‌پرسه:
1. آدرس GitHub repository (اگه هنوز وصل نکردی)
2. پیام commit (اختیاری)
3. پیام release (اختیاری)

بعدش خودکار:
- ✅ همه چیزو commit می‌کنه
- ✅ به GitHub push می‌کنه
- ✅ تگ version می‌سازه
- ✅ GitHub Actions رو trigger می‌کنه

### بعدش چی؟

1. **منتظر بمون 15-20 دقیقه** تا build بشه
2. **برو به**: `https://github.com/USERNAME/k8s-platform-panel/actions`
3. **پیشرفت build رو ببین** (سه تا job موازی)
4. **بعد از اتمام برو به**: `https://github.com/USERNAME/k8s-platform-panel/releases`
5. **دانلود کن**: فایل `.exe`, `.dmg` یا `.AppImage`

---

## 📚 راهنمای کامل

اگه می‌خوای جزئیات بیشتر بدونی:
- [GITHUB-GUIDE.md](GITHUB-GUIDE.md) - راهنمای قدم‌به‌قدم push
- [RELEASE.md](RELEASE.md) - راهنمای کامل Release
- [CHANGELOG.md](CHANGELOG.md) - لیست تغییرات

---

## ⚠️ مشکلات رایج

### خطای "git: command not found"
```powershell
# دانلود و نصب Git:
# https://git-scm.com/download/win
```

### خطای "Authentication failed"
```
نیاز به Personal Access Token داری (نه پسورد عادی!)
GitHub → Settings → Developer settings → Personal access tokens → Generate new token
دسترسی: repo (تمام موارد)
از token به جای password استفاده کن
```

### Build خطا داد
```
برو به:
https://github.com/USERNAME/k8s-platform-panel/actions
لاگ خطا رو ببین
اگه نیاز به Node.js یا dependency بود، Actions خودش نصب می‌کنه
```

---

## 🎯 حالا چیکار کنم؟

بعد از اولین Release:

1. ✅ Share کن با دوستات
2. ✅ Screenshot بگیر و به README اضافه کن
3. ✅ به پروژه ستاره بده ⭐
4. ✅ منتظر Issue ها و PR های دیگران باش
5. ✅ لذت ببر! 🎉

---

**نکته**: اگه می‌خوای دستی کار کنی، نگاه کن به [GITHUB-GUIDE.md](GITHUB-GUIDE.md)
