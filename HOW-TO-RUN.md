# 🚀 راهنمای سریع باز کردن پنل

## گزینه 1: نصب Node.js (برای توسعه محلی)

1. **دانلود Node.js**:
   - به https://nodejs.org بروید
   - دکمه سبز "LTS" را دانلود کنید
   - نصب کنید (Next, Next, Install)

2. **اجرای پنل**:
   ```powershell
   # ترمینال را ببندید و دوباره باز کنید
   cd C:\home\k8s-platform-panel
   npm install
   npm run dev
   ```

3. **باز کردن در مرورگر**:
   - به http://localhost:5173 بروید

---

## گزینه 2: Deploy به Vercel (توصیه می‌شود!)

### مزایا:
✅ بدون نیاز به نصب چیزی
✅ رایگان
✅ سریع (CDN جهانی)
✅ HTTPS خودکار
✅ هر کسی می‌تواند استفاده کند

### مراحل:

1. **ایجاد Repository در GitHub**:
   - به https://github.com بروید
   - "New repository" بزنید
   - نام: `k8s-platform-panel`
   - Public بزنید
   - Create بزنید

2. **آپلود فایل‌ها**:
   
   روش A - اگر Git دارید:
   ```powershell
   cd C:\home\k8s-platform-panel
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/Mehrdad-Hooshmand/k8s-platform-panel
   git push -u origin main
   ```
   
   روش B - بدون Git:
   - همه فایل‌های پوشه `C:\home\k8s-platform-panel` را zip کنید
   - در GitHub روی "uploading an existing file" کلیک کنید
   - فایل‌ها را drag & drop کنید

3. **Deploy به Vercel**:
   - به https://vercel.com/signup بروید
   - "Continue with GitHub" بزنید
   - اجازه دسترسی بدهید
   - روی "Import Project" کلیک کنید
   - `k8s-platform-panel` را انتخاب کنید
   - روی "Deploy" بزنید

4. **تمام!**
   - پنل شما آماده است: `https://k8s-panel.vercel.app`
   - به دوستان لینک بدهید
   - همه می‌توانند از پنل شما استفاده کنند

---

## گزینه 3: استفاده از پنل آنلاین ما (موقت)

تا پنل خودتان را deploy کنید، می‌توانید از این لینک استفاده کنید:

**https://panel.k8s-platform.app** (در حال ساخت)

---

## 🎯 کدام گزینه برای شما مناسب است؟

| گزینه | زمان | مهارت | هزینه | بهترین برای |
|-------|------|-------|-------|-------------|
| Node.js محلی | 10 دقیقه | ساده | رایگان | توسعه و تست |
| Vercel | 5 دقیقه | خیلی ساده | رایگان | استفاده واقعی |
| Docker | 15 دقیقه | متوسط | رایگان | production |
| سرور لینوکس | 20 دقیقه | متوسط | هزینه سرور | self-hosted |

---

## ❓ سوالات متداول

**س: آیا باید Node.js نصب کنم؟**
ج: برای اجرای محلی بله، اما با Vercel نه!

**س: آیا Vercel رایگان است؟**
ج: بله! کاملاً رایگان برای پروژه‌های شخصی.

**س: چند نفر می‌توانند از پنل استفاده کنند؟**
ج: نامحدود! هر کسی که لینک را دارد.

**س: آیا امن است؟**
ج: بله! فقط با API URL و رمز عبور قابل استفاده است.

**س: چه مدت طول می‌کشد تا live شود؟**
ج: با Vercel فقط 5 دقیقه!

---

## 🆘 نیاز به کمک؟

اگر مشکلی داشتید:
1. فایل TUTORIAL-FA.md را بخوانید
2. در GitHub Issue باز کنید
3. در Discussion سوال بپرسید

---

**موفق باشید! 🚀**
