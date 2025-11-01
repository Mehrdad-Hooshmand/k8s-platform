# ☸️ Kubernetes Platform - راهنمای گام‌به‌گام

> **راهنمای کامل برای نصب و استفاده از پلتفرم مدیریت Kubernetes**

این راهنما برای کسانی طراحی شده که اولین بار می‌خواهند از این پلتفرم استفاده کنند.

---

## 📋 فهرست مطالب

1. [پیش‌نیازها](#-پیشنیازها)
2. [نصب کلاستر Kubernetes](#-نصب-کلاستر-kubernetes)
3. [ساخت کاربر مدیر](#-ساخت-کاربر-مدیر)
4. [اتصال به پنل](#-اتصال-به-پنل)
5. [دیپلوی اولین اپلیکیشن](#-دیپلوی-اولین-اپلیکیشن)
6. [مدیریت دیپلویمنت‌ها](#-مدیریت-دیپلویمنتها)
7. [افزودن نود جدید](#-افزودن-نود-جدید)
8. [عیب‌یابی](#-عیبیابی)

---

## 🎯 پیش‌نیازها

### سرور شما باید این مشخصات را داشته باشد:

- **سیستم عامل**: Ubuntu 20.04 یا بالاتر / Debian 11 یا بالاتر
- **حداقل منابع**:
  - CPU: 2 هسته
  - RAM: 4GB
  - Disk: 50GB
- **دسترسی**: SSH با دسترسی root یا sudo
- **شبکه**: IP عمومی یا دامنه

### در کامپیوتر خودتان نیاز دارید:

- مرورگر وب (Chrome, Firefox, Safari, Edge)
- اتصال به اینترنت

---

## 🚀 نصب کلاستر Kubernetes

### مرحله 1: دانلود اسکریپت نصب

روی سرور خود این دستورات را اجرا کنید:

```bash
# دانلود اسکریپت نصب
curl -fsSL https://raw.githubusercontent.com/Mehrdad-Hooshmand/k8s-platform/main/k8s-installer.sh -o k8s-installer.sh

# دادن مجوز اجرا
chmod +x k8s-installer.sh
```

### مرحله 2: نصب کلاستر

```bash
sudo ./k8s-installer.sh init
```

اسکریپت چند سوال می‌پرسد:

1. **محل سرور**: `Iran`, `Outside Iran`, یا `Direct`
   - اگر در ایران هستید: `Iran` را انتخاب کنید
   - اگر خارج از ایران هستید: `Outside Iran`
   - اگر مشکلی با اینترنت ندارید: `Direct`

2. **آدرس IP سرور اصلی**: 
   - IP عمومی سرور را وارد کنید
   - مثال: `185.123.45.67`

3. **پورت SSH** (پیش‌فرض 22):
   - اگر پورت SSH را عوض نکرده‌اید، Enter بزنید
   - اگر عوض کرده‌اید، پورت جدید را وارد کنید

4. **آیا worker دارید؟**:
   - اگر فقط یک سرور دارید: `no`
   - اگر چند سرور دارید: `yes` و IP هر سرور را وارد کنید

نصب شروع می‌شود و حدود **5-10 دقیقه** طول می‌کشد.

### مرحله 3: نصب پنل مدیریت

بعد از نصب موفق کلاستر:

```bash
sudo ./k8s-installer.sh install-panel <DOMAIN> <EMAIL>
```

**مثال**:
```bash
sudo ./k8s-installer.sh install-panel api.mydomain.com admin@mydomain.com
```

- **DOMAIN**: دامنه‌ای که برای API می‌خواهید استفاده کنید
- **EMAIL**: ایمیل شما برای SSL (Let's Encrypt)

پنل نصب می‌شود و در آخر **URL پنل API** را به شما نشان می‌دهد:

```
╔══════════════════════════════════════════════════════════════╗
║                  ✅ Installation Complete!                  ║
╠══════════════════════════════════════════════════════════════╣
║  Management Panel is ready!                                  ║
║                                                              ║
║  📡 API URL:                                                ║
║     https://api.mydomain.com                                ║
║                                                              ║
║  Next steps:                                                 ║
║  1. Run: ./create-admin.sh                                  ║
║  2. Visit: https://panel.k8s-platform.app                   ║
║  3. Connect to your API                                      ║
║  4. Login and start deploying!                               ║
╚══════════════════════════════════════════════════════════════╝
```

**⚠️ مهم**: این URL را یادداشت کنید! به آن نیاز خواهید داشت.

---

## 👤 ساخت کاربر مدیر

### مرحله 1: اجرای اسکریپت

```bash
./create-admin.sh
```

### مرحله 2: وارد کردن اطلاعات

اسکریپت این اطلاعات را می‌پرسد:

```
Admin Email: admin@mydomain.com
Admin Password: ********
Admin Name: Mehrdad Hooshmand
```

**نکات امنیتی**:
- از یک ایمیل معتبر استفاده کنید
- رمز عبور قوی انتخاب کنید (حداقل 8 کاراکتر)
- این اطلاعات را یادداشت کنید!

### مرحله 3: تایید موفقیت

اگر موفق باشد این پیام را می‌بینید:

```
✅ Admin user created successfully!

Email: admin@mydomain.com
You can now login to the panel.
```

---

## 🌐 اتصال به پنل

### مرحله 1: باز کردن پنل

در مرورگر خود این آدرس را باز کنید:

```
https://panel.k8s-platform.app
```

### مرحله 2: اتصال به API

صفحه "Connect to API" باز می‌شود:

1. در کادر "API URL" آدرسی که در مرحله نصب به شما داده شد را وارد کنید:
   ```
   https://api.mydomain.com
   ```

2. روی دکمه **"Connect"** کلیک کنید

3. پنل به API شما متصل می‌شود

### مرحله 3: ورود

صفحه لاگین باز می‌شود:

1. **Email**: ایمیلی که در مرحله ساخت admin وارد کردید
2. **Password**: رمز عبوری که انتخاب کردید
3. روی **"Sign In"** کلیک کنید

**🎉 تبریک! شما وارد پنل شدید!**

---

## 🚀 دیپلوی اولین اپلیکیشن

### مرحله 1: رفتن به Marketplace

از منوی سمت چپ روی **"Apps"** کلیک کنید.

### مرحله 2: انتخاب اپلیکیشن

لیست اپلیکیشن‌های موجود را می‌بینید:
- WordPress
- MySQL
- PostgreSQL
- Redis
- Nextcloud
- Gitea
- Grafana
- و ...

**مثال**: بیایید WordPress نصب کنیم.

1. روی کارت **WordPress** کلیک کنید
2. روی **"Deploy Now"** کلیک کنید

### مرحله 3: تنظیمات دیپلوی

یک فرم باز می‌شود:

```
Name: my-wordpress
Domain: myblog.mydomain.com
Enable SSL: ✓
Database Password: [auto-generated]
```

**توضیحات**:
- **Name**: نام دیپلوی (فقط حروف کوچک و خط تیره)
- **Domain**: دامنه‌ای که می‌خواهید سایت روی آن باشد
- **Enable SSL**: برای HTTPS فعال کنید
- **Database Password**: خودکار ساخته می‌شود (می‌توانید عوض کنید)

### مرحله 4: دیپلوی

روی **"Deploy"** کلیک کنید.

**منتظر بمانید** (2-5 دقیقه):
- کانتینرها دانلود می‌شوند
- دیتابیس نصب می‌شود
- WordPress راه‌اندازی می‌شود
- SSL صادر می‌شود

### مرحله 5: دسترسی به سایت

وقتی دیپلوی کامل شد:

1. Status به **"Running"** تغییر می‌کند
2. یک لینک **"Open Application"** ظاهر می‌شود
3. روی آن کلیک کنید
4. سایت WordPress شما باز می‌شود!

**🎉 تبریک! اولین اپلیکیشن شما آماده است!**

---

## 📦 مدیریت دیپلویمنت‌ها

### مشاهده لیست

از منو روی **"Deployments"** کلیک کنید.

همه دیپلویمنت‌های شما را می‌بینید:
- نام
- وضعیت (Running, Deploying, Error)
- دامنه
- منابع (CPU, RAM)

### عملیات روی دیپلویمنت

برای هر دیپلویمنت می‌توانید:

1. **Restart**: ریستارت اپلیکیشن
   - روی آیکن 🔄 کلیک کنید

2. **Delete**: حذف کامل
   - روی آیکن 🗑️ کلیک کنید
   - تایید کنید

3. **Open**: باز کردن در مرورگر
   - روی "Open Application" کلیک کنید

### مشاهده لاگ‌ها

*قابلیت مشاهده لاگ به زودی اضافه می‌شود*

---

## ➕ افزودن نود جدید

اگر می‌خواهید سرور دیگری به کلاستر اضافه کنید:

### مرحله 1: اجرای دستور

روی **سرور اصلی**:

```bash
sudo ./k8s-installer.sh add-worker <WORKER_IP> [SSH_PORT]
```

**مثال**:
```bash
sudo ./k8s-installer.sh add-worker 185.123.45.68 22
```

### مرحله 2: وارد کردن رمز عبور

رمز عبور SSH سرور جدید را وارد کنید.

### مرحله 3: صبر کنید

نود جدید نصب می‌شود (2-3 دقیقه).

### مرحله 4: تایید

```bash
sudo ./k8s-installer.sh status
```

نود جدید را در لیست می‌بینید:

```
NAME           STATUS   ROLES           AGE   VERSION
master-node    Ready    control-plane   1h    v1.28.5+k3s1
worker-1       Ready    worker          10m   v1.28.5+k3s1
```

---

## 🔧 عیب‌یابی

### مشکل: پنل به API وصل نمی‌شود

**حل**:

1. چک کنید دامنه به IP سرور اشاره می‌کند:
   ```bash
   nslookup api.mydomain.com
   ```

2. چک کنید API در حال اجرا است:
   ```bash
   sudo kubectl get pods -n k8s-management
   ```

3. چک کنید Traefik کار می‌کند:
   ```bash
   sudo kubectl get pods -n kube-system | grep traefik
   ```

### مشکل: SSL کار نمی‌کند

**حل**:

1. چک کنید cert-manager نصب است:
   ```bash
   sudo kubectl get pods -n cert-manager
   ```

2. چک کنید certificate صادر شده:
   ```bash
   sudo kubectl get certificates -A
   ```

3. اگر Pending است، 5-10 دقیقه صبر کنید (Let's Encrypt کند است)

### مشکل: دیپلوی Error می‌دهد

**حل**:

1. از پنل Deployments، روی دیپلوی کلیک کنید
2. Status را ببینید
3. روی سرور:
   ```bash
   sudo kubectl get pods -A
   ```
   
   پادی که CrashLoopBackOff است را پیدا کنید:
   ```bash
   sudo kubectl logs <POD_NAME> -n <NAMESPACE>
   ```

### مشکل: رمز عبور admin را فراموش کردم

**حل**:

دوباره admin بسازید:

```bash
# حذف admin قبلی (اگر وجود دارد)
sudo kubectl exec -it -n k8s-management \
  $(kubectl get pods -n k8s-management -l app=api -o name | head -1) \
  -- psql -U postgres -d k8s_management \
  -c "DELETE FROM users WHERE email='admin@mydomain.com';"

# ساخت admin جدید
./create-admin.sh
```

### مشکل: هیچ چیز کار نمی‌کند!

**حل نهایی**: نصب مجدد

```bash
# حذف K3s
/usr/local/bin/k3s-uninstall.sh

# نصب دوباره
sudo ./k8s-installer.sh init
sudo ./k8s-installer.sh install-panel <DOMAIN> <EMAIL>
./create-admin.sh
```

---

## 📚 منابع بیشتر

- **مستندات Kubernetes**: https://kubernetes.io/docs/
- **مستندات K3s**: https://docs.k3s.io/
- **مستندات Traefik**: https://doc.traefik.io/traefik/
- **مستندات cert-manager**: https://cert-manager.io/docs/

---

## 💬 پشتیبانی

- **GitHub Issues**: https://github.com/Mehrdad-Hooshmand/k8s-platform/issues
- **Discussion**: https://github.com/Mehrdad-Hooshmand/k8s-platform/discussions

---

## 🎯 مراحل بعدی

حالا که پلتفرم شما آماده است:

1. ✅ **دیپلوی کنید**: اپلیکیشن‌های بیشتری از Marketplace نصب کنید
2. ✅ **مانیتور کنید**: Grafana + Prometheus برای مانیتورینگ نصب کنید
3. ✅ **بک‌آپ بگیرید**: از دیتابیس‌ها و فایل‌ها بک‌آپ بگیرید
4. ✅ **اتوماسیون**: CI/CD با Gitea + Drone بسازید

---

**ساخته شده با ❤️ برای جامعه Kubernetes**
