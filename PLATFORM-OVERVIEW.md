# 🌟 پلتفرم Self-Hosted مدیریت Kubernetes

## 🎯 این پلتفرم چیست؟

یک **پلتفرم کامل Self-Hosted** که به هر کاربر امکان می‌دهد یک **mini-cloud شخصی** روی سرور/VM خودش داشته باشد.

### ویژگی‌های کلیدی:
- ✅ هر کاربر یک کلاستر Kubernetes مستقل دارد
- ✅ پنل مدیریتی اختصاصی با دامنه دلخواه
- ✅ نصب خودکار با یک دستور
- ✅ یک‌کلیکی deploy برنامه‌ها (WordPress, WebTop, etc.)
- ✅ مدیریت کامل منابع (CPU, RAM, Storage)
- ✅ SSL خودکار با Let's Encrypt
- ✅ پشتیبانی از Registry Mirror (دور زدن تحریم)

---

## 🏗 معماری سیستم

```
┌────────────────────────────────────────────────────────────┐
│          سرور/VM کاربر (مثلاً 94.182.92.207)              │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │           Kubernetes Cluster (K3s)                   │ │
│  │                                                      │ │
│  │  ┌─────────────────────────────────────────────┐    │ │
│  │  │  Namespace: k8s-management                  │    │ │
│  │  │  ┌─────────────┐  ┌─────────────────────┐  │    │ │
│  │  │  │ PostgreSQL  │  │  API Backend (Go)   │  │    │ │
│  │  │  │             │  │  - User Auth        │  │    │ │
│  │  │  │             │  │  - Cluster Mgmt     │  │    │ │
│  │  │  └─────────────┘  │  - Deploy Apps      │  │    │ │
│  │  │                   └─────────────────────┘  │    │ │
│  │  │  ┌─────────────┐  ┌─────────────────────┐  │    │ │
│  │  │  │   Redis     │  │  Frontend (React)   │  │    │ │
│  │  │  │   Cache     │  │  - Dashboard        │  │    │ │
│  │  │  │             │  │  - App Marketplace  │  │    │ │
│  │  │  └─────────────┘  └─────────────────────┘  │    │ │
│  │  └─────────────────────────────────────────────┘    │ │
│  │                                                      │ │
│  │  ┌─────────────────────────────────────────────┐    │ │
│  │  │  User Apps (کاربر از پنل deploy می‌کند)    │    │ │
│  │  │  ┌────────────┐  ┌──────────┐              │    │ │
│  │  │  │ WordPress  │  │  WebTop  │   ...        │    │ │
│  │  │  │ (blog)     │  │ (desktop)│              │    │ │
│  │  │  └────────────┘  └──────────┘              │    │ │
│  │  └─────────────────────────────────────────────┘    │ │
│  │                                                      │ │
│  │  Ingress (Traefik):                                 │ │
│  │    - panel.example.com  → Management Panel          │ │
│  │    - blog.example.com   → WordPress                 │ │
│  │    - desktop.example.com → WebTop                   │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

---

## 📦 اجزای سیستم

### 1️⃣ **Kubernetes Cluster (K3s)**
- نسخه سبک Kubernetes
- مدیریت تمام containerها
- مقیاس‌پذیر (می‌توان Worker اضافه کرد)

### 2️⃣ **Management Panel**
نصب شده در `namespace: k8s-management`

**Backend (API):**
- زبان: Go
- Framework: Gin
- Database: PostgreSQL
- Cache: Redis
- احراز هویت: JWT
- عملکرد: مدیریت cluster، deploy apps، کنترل منابع

**Frontend (Panel):**
- Framework: React (یا Vue)
- UI: Tailwind CSS
- ویژگی‌ها:
  - Dashboard با نمودارهای زنده
  - App Marketplace
  - یک‌کلیکی deploy
  - مدیریت دامنه‌ها و SSL
  - مانیتورینگ منابع

### 3️⃣ **Applications**
هر app که کاربر از پنل deploy کنه:
- WordPress (وب‌سایت/بلاگ)
- WebTop (دسکتاپ مجازی)
- Nextcloud (فضای ابری)
- GitLab (DevOps)
- Monitoring Tools (Grafana, Prometheus)
- و هر چیز دیگری...

---

## 🚀 نصب و راه‌اندازی

### پیش‌نیازها:
```bash
# 1. یک یا چند سرور با Ubuntu/Debian
# 2. حداقل 4GB RAM و 2 CPU برای Master
# 3. دسترسی SSH با کلید
# 4. یک دامنه (مثل panel.example.com)
```

### مرحله 1: تنظیم SSH Key

```bash
# روی سیستم محلی:
ssh-keygen -t rsa -b 4096

# کپی به سرور Master:
ssh-copy-id -p 22 root@YOUR_SERVER_IP

# تست:
ssh -p 22 root@YOUR_SERVER_IP
```

### مرحله 2: تنظیم DNS

قبل از نصب، DNS را تنظیم کنید:

```
Type: A
Name: panel
Value: YOUR_SERVER_IP
TTL: 300
```

تست کنید:
```bash
nslookup panel.example.com
# باید به IP سرور شما اشاره کند
```

### مرحله 3: اجرای نصب

```bash
# دانلود اسکریپت:
wget https://raw.githubusercontent.com/YOUR_REPO/k8s-installer.sh
chmod +x k8s-installer.sh

# اجرا:
sudo ./k8s-installer.sh init
```

### مرحله 4: پاسخ به سوالات

اسکریپت از شما می‌پرسد:

```
1. مکان سرور (ایران/خارج): 1
2. IP سرور Master: YOUR_SERVER_IP
3. پورت SSH: 22
4. چند Worker: 0 (فعلاً فقط Master)
5. SSL فعال؟ y
6. دامنه پنل: panel.example.com
7. ایمیل: your@email.com
```

### مرحله 5: صبر برای نصب ⏳

نصب 10-15 دقیقه طول می‌کشه:
- نصب K3s
- نصب Traefik
- نصب cert-manager
- نصب PostgreSQL
- نصب Redis
- نصب API Backend
- نصب Frontend Panel
- صدور SSL Certificate

### مرحله 6: دسترسی به پنل 🎉

```
URL: https://panel.example.com
```

---

## 👤 ساخت اولین کاربر Admin

بعد از نصب، باید یک کاربر admin بسازید:

### روش 1: از API مستقیم

```bash
# اتصال به سرور:
ssh -p 22 root@YOUR_SERVER_IP

# ساخت کاربر admin:
kubectl exec -it -n k8s-management deployment/api -- /bin/sh

# داخل container:
# (این بخش بعداً با یه script تکمیل می‌شه)
```

### روش 2: از Database مستقیم

```bash
# اتصال به PostgreSQL:
kubectl exec -it -n k8s-management deployment/postgres -- psql -U postgres -d k8s_management

# ایجاد کاربر:
INSERT INTO users (email, password, name, role, is_active, created_at, updated_at)
VALUES (
  'admin@example.com',
  '$2a$10$...',  -- bcrypt hash of password
  'Admin User',
  'admin',
  true,
  NOW(),
  NOW()
);
```

**بهتر است یه اسکریپت کمکی بسازم برای این کار!**

---

## 📱 استفاده از پنل

### ورود به پنل:
```
https://panel.example.com
Email: admin@example.com
Password: YOUR_PASSWORD
```

### Dashboard:
- نمای کلی از منابع
- تعداد apps در حال اجرا
- استفاده از CPU/RAM/Storage
- نمودارهای زنده

### App Marketplace:

**دسته‌بندی‌ها:**
1. **وب و CMS**
   - WordPress (بلاگ/سایت)
   - Ghost (بلاگ حرفه‌ای)
   - Drupal

2. **دسکتاپ مجازی**
   - WebTop (Ubuntu Desktop در مرورگر)
   - Kasm (Multi-user desktops)

3. **ذخیره‌سازی**
   - Nextcloud (فضای ابری)
   - MinIO (Object Storage)

4. **DevOps**
   - GitLab (Git + CI/CD)
   - Jenkins
   - Gitea

5. **Monitoring**
   - Grafana + Prometheus
   - Uptime Kuma

### Deploy یک App:

1. کلیک روی "WordPress" در Marketplace
2. پر کردن فرم:
   ```
   نام: my-blog
   دامنه: blog.example.com
   SSL: فعال
   منابع:
     - CPU: 500m (0.5 core)
     - RAM: 1Gi
     - Storage: 10Gi
   دیتابیس:
     - نام: wordpress_db
     - پسورد: (خودکار)
   ```
3. کلیک "Deploy"
4. صبر 2-3 دقیقه
5. دسترسی: `https://blog.example.com`

---

## 🔧 مدیریت Cluster

### افزودن Worker Node:

```bash
./k8s-installer.sh add-worker 192.168.1.101 22
```

یا از پنل:
1. Settings → Nodes
2. Add Worker
3. IP: 192.168.1.101
4. SSH Port: 22
5. کلیک "Add"

### بررسی وضعیت:

```bash
./k8s-installer.sh status
```

یا در پنل:
- Dashboard → Cluster Status

---

## 📊 مانیتورینگ و لاگ‌ها

### بررسی Pods:
```bash
kubectl get pods -A
```

### لاگ پنل مدیریت:
```bash
kubectl logs -n k8s-management deployment/api -f
```

### لاگ یک app:
```bash
kubectl logs -n default deployment/wordpress -f
```

---

## 🔐 امنیت

### تغییر JWT Secret:
```bash
# تولید کلید جدید:
openssl rand -base64 64

# آپدیت Secret:
kubectl edit secret api-secret -n k8s-management
```

### محدود کردن SSH:
```bash
# فقط از IP مشخص:
ufw allow from YOUR_IP to any port 22
```

### Backup دیتابیس:
```bash
kubectl exec -n k8s-management deployment/postgres -- \
  pg_dump -U postgres k8s_management > backup.sql
```

---

## 🛠 عیب‌یابی

### پنل بالا نمی‌آید:

```bash
# بررسی Pods:
kubectl get pods -n k8s-management

# بررسی لاگ API:
kubectl logs -n k8s-management deployment/api

# بررسی لاگ Panel:
kubectl logs -n k8s-management deployment/panel
```

### SSL Certificate صادر نشد:

```bash
# بررسی cert-manager:
kubectl get certificate -A

# بررسی لاگ:
kubectl logs -n cert-manager deployment/cert-manager

# بررسی DNS:
nslookup panel.example.com
```

### Database connection failed:

```bash
# بررسی PostgreSQL:
kubectl get pods -n k8s-management | grep postgres

# بررسی لاگ:
kubectl logs -n k8s-management deployment/postgres

# تست اتصال:
kubectl exec -it -n k8s-management deployment/postgres -- psql -U postgres -d k8s_management
```

---

## 🚦 Roadmap

### فاز فعلی (v1.0):
- [x] نصب خودکار Kubernetes
- [x] نصب خودکار پنل مدیریت
- [x] احراز هویت کاربران
- [ ] App Marketplace (در حال توسعه)
- [ ] One-click deployment

### فاز بعدی (v1.1):
- [ ] مانیتورینگ با Grafana
- [ ] Backup خودکار
- [ ] Multi-cluster management
- [ ] Resource quotas
- [ ] Billing & usage tracking

### فاز آینده (v2.0):
- [ ] AI-powered resource optimization
- [ ] Auto-scaling
- [ ] Disaster recovery
- [ ] Multi-tenant isolation

---

## 💰 Use Cases

### 1. **Hosting Provider**
شما یک شرکت هاستینگ هستید:
- به هر مشتری یک VM می‌دید
- این پلتفرم روش نصب می‌شه
- مشتری خودش apps رو مدیریت می‌کنه
- شما فقط سرور رو نگه‌داری می‌کنید

### 2. **Development Team**
تیم توسعه شما:
- هر developer یک cluster شخصی داره
- تست و staging را خودش manage می‌کنه
- production روی cluster مجزا

### 3. **Agency**
شما یک آژانس طراحی وب هستید:
- برای هر پروژه/کلاینت یک cluster
- مدیریت آسان چندین وب‌سایت
- جداسازی کامل بین کلاینت‌ها

### 4. **Personal Cloud**
برای خودتان:
- جایگزین Google Drive → Nextcloud
- جایگزین Gmail → Mail server
- Blog شخصی → WordPress
- همه روی سرور خودتون!

---

## 🤝 مشارکت

این پروژه Open Source است!

```bash
git clone https://github.com/YOUR_REPO/k8s-platform
cd k8s-platform

# ساخت feature جدید:
git checkout -b feature/amazing-feature
git commit -m "Add amazing feature"
git push origin feature/amazing-feature
```

---

## 📄 لایسنس

MIT License - استفاده آزاد برای هر منظوری!

---

## 🙏 تشکر

از این پروژه‌های عالی استفاده شده:
- Kubernetes / K3s
- Traefik
- cert-manager
- PostgreSQL
- Redis
- Go / Gin
- React

---

**ساخته شده با ❤️ برای جامعه Open Source**
