# راهنمای کامل Push به GitHub و ساخت Release

این راهنما قدم‌به‌قدم نحوه آپلود کد به GitHub و ساخت اولین Release رو توضیح میده.

## 📋 پیش‌نیازها

قبل از شروع مطمئن شو:

- [ ] Git نصب شده (چک کن: `git --version`)
- [ ] حساب GitHub داری
- [ ] یک repository خالی ساختی توی GitHub

## 🚀 مراحل کامل

### مرحله 1️⃣: ساخت Repository در GitHub

1. برو به https://github.com
2. کلیک روی **New Repository** (سبز رنگ، بالا سمت راست)
3. پر کن:
   - **Repository name**: `k8s-platform-panel`
   - **Description**: `Desktop application for managing Kubernetes clusters - اپلیکیشن دسکتاپ مدیریت Kubernetes`
   - **Public** یا **Private** (به انتخابت)
   - ❌ **خالی بزار** (Don't initialize این repository)
4. کلیک روی **Create repository**
5. آدرس repository رو کپی کن (مثلاً: `https://github.com/USERNAME/k8s-platform-panel.git`)

### مرحله 2️⃣: Initialize کردن Git در پروژه

```powershell
# برو توی پوشه پروژه
cd C:\home\k8s-platform-panel

# مطمئن شو که Git نصب هست
git --version

# اگه اولین باره که Git استفاده می‌کنی، config کن:
git config --global user.name "اسم تو"
git config --global user.email "ایمیل@github.com"

# Initialize کن
git init

# Branch اصلی رو main بزار
git branch -M main
```

### مرحله 3️⃣: افزودن فایل‌ها به Git

```powershell
# تمام فایل‌ها رو اضافه کن
git add .

# چک کن چی اضافه شده
git status

# اولین commit
git commit -m "feat: initial commit - desktop app with Electron"
```

### مرحله 4️⃣: اتصال به GitHub

```powershell
# آدرس repository رو وصل کن (جایگزین USERNAME/REPO رو با آدرس خودت کن)
git remote add origin https://github.com/USERNAME/k8s-platform-panel.git

# چک کن درست وصل شده
git remote -v
```

### مرحله 5️⃣: Push کردن کد

```powershell
# اولین push
git push -u origin main
```

**نکته**: اگه GitHub login خواست:
- Username: نام کاربری GitHub
- Password: **Personal Access Token** (نه پسورد عادی!)
  - برای ساخت token: GitHub → Settings → Developer settings → Personal access tokens → Generate new token
  - دسترسی‌های لازم: `repo` (تمام موارد)

### مرحله 6️⃣: ساخت اولین Release 🎉

```powershell
# تگ version 1.0.0 بساز
git tag -a v1.0.0 -m "Release v1.0.0 - First stable desktop app"

# تگ رو push کن (این باعث trigger شدن GitHub Actions میشه!)
git push origin v1.0.0
```

### مرحله 7️⃣: مشاهده Build Process

1. برو به repository توی GitHub
2. کلیک روی تب **Actions**
3. می‌بینی که workflow "Build and Release Desktop App" شروع شده
4. کلیک روی workflow run برای دیدن جزئیات
5. منتظر بمون تا تمام بشه (15-20 دقیقه)

می‌بینی 3 تا job موازی اجرا میشه:
- ✅ **Windows**: build می‌کنه `.exe`
- ✅ **macOS**: build می‌کنه `.dmg`
- ✅ **Linux**: build می‌کنه `.AppImage` و `.deb`

### مرحله 8️⃣: دانلود Release

بعد از اتمام build:

1. برو به تب **Releases** (سمت راست صفحه)
2. می‌بینی **v1.0.0** با تمام فایل‌ها:
   - `K8s-Platform-Manager-Setup-1.0.0.exe` (Windows)
   - `K8s-Platform-Manager-1.0.0.dmg` (macOS)
   - `K8s-Platform-Manager-1.0.0.AppImage` (Linux portable)
   - `k8s-platform-manager_1.0.0_amd64.deb` (Linux package)
3. دانلود کن و تست کن! 🎉

## 🔄 برای آپدیت‌های بعدی

### تغییرات جدید رو اضافه کن:

```powershell
# تغییرات رو ببین
git status

# اضافه کن
git add .

# Commit با پیام مناسب
git commit -m "feat: added PostgreSQL and Redis templates"

# Push کن
git push origin main
```

### وقتی آماده Release جدید شدی:

```powershell
# Version توی package.json رو آپدیت کن (مثلاً 1.1.0)

# Commit کن
git add package.json
git commit -m "chore: bump version to 1.1.0"
git push origin main

# تگ جدید بساز
git tag -a v1.1.0 -m "Release v1.1.0 - Added more app templates"

# Push کن (auto-build شروع میشه!)
git push origin v1.1.0
```

## 🎯 Commit Message Convention

از این الگو استفاده کن:

```
feat: ویژگی جدید (feature)
fix: رفع باگ (bug fix)
docs: تغییر مستندات
style: تغییرات ظاهری (formatting, spacing)
refactor: refactor کد بدون تغییر عملکرد
test: اضافه کردن تست
chore: کارهای maintenance (bump version, dependencies)
```

مثال‌ها:
```powershell
git commit -m "feat: added Nextcloud app template"
git commit -m "fix: deployment credentials display bug"
git commit -m "docs: updated installation guide"
git commit -m "chore: bump version to 1.1.0"
```

## 📊 Branch Strategy (ساده)

برای الان یک branch کافیه:
- **main**: کد stable و production-ready

اگه بعداً تیمی شدی:
- **main**: production
- **develop**: development
- **feature/xyz**: ویژگی‌های جدید

## 🚨 اگه مشکلی پیش اومد

### خطای Authentication:

```powershell
# استفاده از Personal Access Token
# GitHub → Settings → Developer settings → Personal access tokens
# Generate token با repo access
# از token به جای password استفاده کن
```

### خطای Push:

```powershell
# اگه گفت remote changes وجود داره
git pull origin main --rebase
git push origin main
```

### خطای Build در Actions:

1. برو به Actions tab
2. کلیک روی failed run
3. لاگ‌ها رو بخون
4. مشکل رو رفع کن
5. تگ جدید بزن (مثلاً v1.0.1)

## ✅ Checklist نهایی

قبل از اولین push:

- [ ] `.gitignore` موجوده و node_modules رو ignore می‌کنه
- [ ] `package.json` version درست داره (1.0.0)
- [ ] تمام فایل‌های ضروری commit شدن
- [ ] Git config شده (name و email)
- [ ] GitHub repository ساخته شده
- [ ] Remote origin اضافه شده

قبل از هر Release:

- [ ] تمام تغییرات commit و push شدن
- [ ] `package.json` version آپدیت شده
- [ ] `CHANGELOG.md` آپدیت شده
- [ ] همه چیز تست شده
- [ ] مستندات بروز هستند

## 🎉 مرحله بعدی

بعد از اولین Release موفق:

1. ✅ Share کن با دیگران
2. ✅ یه README خوب بنویس با screenshots
3. ✅ Documentation رو کامل کن
4. ✅ Issues و Discussions رو فعال کن
5. ✅ ستاره‌ها رو جمع کن! ⭐

موفق باشی! 🚀
