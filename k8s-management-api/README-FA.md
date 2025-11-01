# 🎯 راهنمای سریع API مدیریت Kubernetes

این API به زبان **Go** نوشته شده و برای مدیریت کامل کلاستر Kubernetes طراحی شده.

---

## 🚀 شروع سریع

### 1. نصب و راه‌اندازی

```bash
cd k8s-management-api

# کپی فایل تنظیمات
cp .env.example .env

# ویرایش تنظیمات
nano .env

# راه‌اندازی با Docker Compose
docker-compose up -d

# بررسی لاگ‌ها
docker-compose logs -f api
```

API در آدرس `http://localhost:8080` در دسترس است.

---

### 2. ساخت اولین کاربر

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePass123",
    "name": "Admin User"
  }'
```

**پاسخ:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "user"
  },
  "tokens": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 86400
  }
}
```

**مهم:** `access_token` را کپی کنید، برای تمام درخواست‌های بعدی نیاز دارید!

---

### 3. ساخت کلاستر جدید

```bash
curl -X POST http://localhost:8080/api/v1/clusters \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "کلاستر تولید",
    "description": "کلاستر اصلی پروداکشن",
    "master_ip": "192.168.1.100",
    "master_ssh_port": 22,
    "use_registry_mirror": true,
    "registry_domain": "registry.haiocloud.com",
    "registry_user": "admin",
    "registry_password": "SecurePass123",
    "enable_ssl": true,
    "panel_domain": "panel.example.com",
    "ssl_email": "admin@example.com"
  }'
```

**توضیحات پارامترها:**

- `name`: نام کلاستر
- `master_ip`: آدرس IP سرور Master
- `master_ssh_port`: پورت SSH (معمولاً 22 یا 2280)
- `use_registry_mirror`: استفاده از Registry Mirror (برای دور زدن تحریم)
- `registry_domain`: دامنه Registry (مثل `registry.haiocloud.com`)
- `enable_ssl`: فعال‌سازی SSL برای پنل مدیریت
- `panel_domain`: دامنه پنل مدیریت

**پاسخ:**
```json
{
  "message": "Cluster creation started",
  "cluster": {
    "id": 1,
    "name": "کلاستر تولید",
    "status": "pending",
    "master_ip": "192.168.1.100"
  }
}
```

---

### 4. بررسی وضعیت کلاستر

```bash
curl -X GET http://localhost:8080/api/v1/clusters/1/status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**پاسخ:**
```json
{
  "cluster_id": 1,
  "status": "ready",
  "message": "Cluster is ready",
  "k8s_version": "v1.28.5+k3s1",
  "nodes": 1,
  "pods": 5,
  "services": 3
}
```

---

### 5. افزودن Worker Node

```bash
curl -X POST http://localhost:8080/api/v1/clusters/1/nodes \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "worker-1",
    "ip": "192.168.1.101",
    "ssh_port": 22
  }'
```

---

## 📋 دستورات مفید

### لیست کلاستر‌ها
```bash
curl -X GET http://localhost:8080/api/v1/clusters \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### لیست Node‌های یک کلاستر
```bash
curl -X GET http://localhost:8080/api/v1/clusters/1/nodes \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### حذف کلاستر
```bash
curl -X DELETE http://localhost:8080/api/v1/clusters/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### حذف Node
```bash
curl -X DELETE http://localhost:8080/api/v1/clusters/1/nodes/2 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🔍 بررسی سلامت API

```bash
curl http://localhost:8080/health
```

**پاسخ:**
```json
{
  "status": "ok",
  "message": "K8s Management API is running"
}
```

---

## 🗂 ساختار پروژه

```
k8s-management-api/
├── cmd/
│   └── api/
│       └── main.go              # نقطه ورود اصلی
├── internal/
│   ├── config/
│   │   └── config.go           # تنظیمات
│   ├── database/
│   │   └── database.go         # اتصال به دیتابیس
│   ├── models/
│   │   └── models.go           # مدل‌های دیتابیس
│   ├── handlers/
│   │   ├── auth.go            # احراز هویت
│   │   ├── cluster.go         # مدیریت کلاستر
│   │   ├── node.go            # مدیریت Node
│   │   ├── application.go     # کاتالوگ برنامه‌ها
│   │   └── deployment.go      # Deploy برنامه‌ها
│   ├── services/
│   │   └── cluster.go         # لاجیک نصب کلاستر
│   ├── middleware/
│   │   └── auth.go            # Middleware احراز هویت
│   └── routes/
│       └── routes.go          # مسیریابی API
├── docker-compose.yml         # ترکیب سرویس‌ها
├── Dockerfile                 # ساخت Image
├── go.mod                     # وابستگی‌ها
├── Makefile                   # دستورات کمکی
└── README.md                  # مستندات
```

---

## 🔧 تنظیمات مهم

### فایل `.env`

```env
# محیط اجرا
ENVIRONMENT=development

# پورت API
PORT=8080

# دیتابیس PostgreSQL
DATABASE_URL=postgres://postgres:postgres@postgres:5432/k8s_management?sslmode=disable

# Redis
REDIS_URL=redis://redis:6379/0

# کلید JWT (حتماً تغییر دهید!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

---

## 🛠 دستورات Docker Compose

```bash
# شروع تمام سرویس‌ها
docker-compose up -d

# بررسی وضعیت
docker-compose ps

# مشاهده لاگ‌ها
docker-compose logs -f

# مشاهده لاگ یک سرویس خاص
docker-compose logs -f api

# توقف سرویس‌ها
docker-compose down

# حذف کامل (با Volume‌ها)
docker-compose down -v

# ری‌بیلد Image
docker-compose build --no-cache

# شروع مجدد یک سرویس
docker-compose restart api
```

---

## 🐛 عیب‌یابی

### مشکل: دیتابیس متصل نمی‌شود

```bash
# بررسی وضعیت PostgreSQL
docker-compose logs postgres

# ورود به container دیتابیس
docker exec -it k8s-mgmt-postgres psql -U postgres

# لیست دیتابیس‌ها
\l

# خروج
\q
```

---

### مشکل: Redis متصل نمی‌شود

```bash
# بررسی وضعیت Redis
docker-compose logs redis

# ورود به Redis CLI
docker exec -it k8s-mgmt-redis redis-cli

# تست
PING

# خروج
exit
```

---

### مشکل: API شروع نمی‌شود

```bash
# بررسی لاگ API
docker-compose logs api

# ری‌استارت API
docker-compose restart api

# بررسی پورت‌ها
docker ps
netstat -tulpn | grep 8080
```

---

## 📊 دیتابیس

### اتصال به PostgreSQL

```bash
docker exec -it k8s-mgmt-postgres psql -U postgres -d k8s_management
```

### کوئری‌های مفید

```sql
-- لیست کاربران
SELECT id, email, name, role, is_active FROM users;

-- لیست کلاستر‌ها
SELECT id, name, master_ip, status FROM clusters;

-- لیست Node‌ها
SELECT n.id, n.name, n.ip, n.status, c.name as cluster_name 
FROM nodes n 
JOIN clusters c ON n.cluster_id = c.id;

-- تعداد Deployment‌ها
SELECT COUNT(*) FROM deployments;
```

---

## 🔐 امنیت

### تغییر JWT Secret

```bash
# تولید کلید تصادفی
openssl rand -base64 64

# یا
head -c 64 /dev/urandom | base64
```

کلید تولید شده را در `.env` قرار دهید:
```env
JWT_SECRET=<کلید-تولید-شده>
```

### تبدیل کاربر به Admin

```sql
docker exec -it k8s-mgmt-postgres psql -U postgres -d k8s_management

UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

---

## 🎯 مرحله بعدی: پنل مدیریت

بعد از آماده شدن API، می‌توانید پنل وب را بسازید:

### تکنولوژی پیشنهادی:
- **Frontend**: React + Vite + TypeScript
- **UI Framework**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand یا React Query
- **HTTP Client**: Axios

### صفحات اصلی پنل:
1. 🔐 Login / Register
2. 📊 Dashboard (نمای کلی کلاستر‌ها)
3. 🎛 Cluster Management
4. 🖥 Node Management
5. 📦 App Marketplace
6. 🚀 Deployment Management
7. 👤 Profile Settings

---

## 💡 نکات مهم

1. **SSH Keys**: حتماً SSH Key بین API و سرورها تنظیم کنید
2. **Firewall**: پورت 6443 (K8s API) باید بین Master و Workers باز باشد
3. **Security**: در پروداکشن حتماً از HTTPS استفاده کنید
4. **Backup**: از دیتابیس و Volume‌های Docker بک‌آپ بگیرید
5. **Monitoring**: از Prometheus/Grafana برای مانیتورینگ استفاده کنید

---

## 📞 پشتیبانی

اگر مشکلی دارید:
1. لاگ‌های Docker را چک کنید: `docker-compose logs`
2. وضعیت سرویس‌ها را بررسی کنید: `docker-compose ps`
3. دیتابیس را چک کنید
4. تنظیمات `.env` را بررسی کنید

---

## ✅ چک‌لیست راه‌اندازی

- [ ] Docker و Docker Compose نصب شده
- [ ] فایل `.env` کانفیگ شده
- [ ] JWT_SECRET تغییر کرده
- [ ] PostgreSQL و Redis در حال اجرا هستند
- [ ] API شروع شده (`/health` پاسخ می‌دهد)
- [ ] کاربر اول ساخته شده
- [ ] کلاستر اول ساخته شده
- [ ] SSH Key بین API و سرورها تنظیم شده

---

**موفق باشید! 🎉**
