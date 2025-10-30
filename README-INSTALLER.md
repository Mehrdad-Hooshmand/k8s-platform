# 🚀 راهنمای نصب و راه‌اندازی کلاستر Kubernetes

این اسکریپت به شما امکان می‌دهد با چند دستور ساده، یک کلاستر Kubernetes کامل راه‌اندازی کنید.

---

## 📋 فهرست مطالب

1. [پیش‌نیازها](#پیش‌نیازها)
2. [نصب اولیه کلاستر](#نصب-اولیه-کلاستر)
3. [افزودن Worker Node جدید](#افزودن-worker-node-جدید)
4. [بررسی وضعیت کلاستر](#بررسی-وضعیت-کلاستر)
5. [عیب‌یابی](#عیب‌یابی)
6. [سوالات متداول](#سوالات-متداول)

---

## 🔧 پیش‌نیازها

### الزامات سرورها:

- **سیستم عامل**: Ubuntu 20.04/22.04 یا Debian 11/12
- **CPU**: حداقل 2 هسته (برای Production: 4+ هسته)
- **RAM**: حداقل 2GB (برای Production: 4GB+)
- **دیسک**: حداقل 20GB فضای خالی
- **شبکه**: اتصال اینترنت پایدار
- **دسترسی**: Root access با SSH

### دسترسی SSH:

قبل از شروع، باید SSH Key را روی تمام سرورها تنظیم کنید:

```bash
# روی سرور مدیریت (جایی که اسکریپت را اجرا می‌کنید):
ssh-keygen -t rsa -b 4096 -C "k8s-cluster"

# کپی کردن SSH Key به Master Node:
ssh-copy-id -p 2280 root@94.182.92.207

# کپی کردن SSH Key به Worker Nodes:
ssh-copy-id -p 2280 root@94.182.92.203
ssh-copy-id -p 2280 root@94.182.92.241
```

بعد از این کار، تست کنید که بدون پسورد وارد می‌شوید:

```bash
ssh -p 2280 root@94.182.92.207
```

---

## 🎯 نصب اولیه کلاستر

### مرحله 1: دانلود و آماده‌سازی اسکریپت

```bash
# دانلود اسکریپت (یا آپلود به سرور)
chmod +x k8s-installer.sh
```

### مرحله 2: اجرای نصب

```bash
sudo ./k8s-installer.sh init
```

### مرحله 3: پاسخ به سوالات

اسکریپت از شما سوالات زیر را می‌پرسد:

#### ✅ سوال 1: مکان سرور

```
╔════════════════════════════════════════╗
║  مکان سرور خود را انتخاب کنید       ║
╚════════════════════════════════════════╝

  1) ایران (Iran)
  2) خارج از ایران (Outside Iran)

انتخاب شما (1 یا 2): 
```

**راهنما:**
- اگر سرورهای شما در ایران هستند: `1` را انتخاب کنید
- اگر در خارج از ایران هستند: `2` را انتخاب کنید
- **نکته مهم**: در هر دو حالت از Registry Mirror استفاده می‌شود تا تحریم‌ها مشکلی ایجاد نکنند

#### ✅ سوال 2: اطلاعات Master Node

```
╔════════════════════════════════════════╗
║  اطلاعات Master Node                 ║
╚════════════════════════════════════════╝

آدرس IP سرور Master را وارد کنید: 94.182.92.207
پورت SSH سرور Master (پیش‌فرض 22): 2280
```

**راهنما:**
- IP سرور Master خود را وارد کنید
- اگر پورت SSH شما 22 است، فقط Enter بزنید
- اگر پورت دیگری است (مثل 2280)، آن را وارد کنید

#### ✅ سوال 3: تعداد و اطلاعات Worker Nodes

```
╔════════════════════════════════════════╗
║  اطلاعات Worker Nodes                ║
╚════════════════════════════════════════╝

چند Worker Node دارید؟ (عدد وارد کنید، مثلاً 2): 2

Worker Node #1:
  آدرس IP Worker #1: 94.182.92.203
  پورت SSH Worker #1 (پیش‌فرض 22): 2280

Worker Node #2:
  آدرس IP Worker #2: 94.182.92.241
  پورت SSH Worker #2 (پیش‌فرض 22): 2280
```

**راهنما:**
- تعداد Worker Nodes خود را وارد کنید
- برای هر Worker، IP و پورت SSH را مشخص کنید
- می‌توانید بعداً Worker اضافه کنید

#### ✅ سوال 4: تنظیمات SSL و دامنه

```
╔════════════════════════════════════════╗
║  تنظیمات SSL و دامنه                ║
╚════════════════════════════════════════╝

آیا می‌خواهید SSL برای پنل مدیریت فعال کنید؟ (y/n): y
دامنه اصلی برای پنل مدیریت (مثال: panel.haiocloud.com): panel.haiocloud.com
ایمیل برای Let's Encrypt (مثال: admin@haiocloud.com): admin@haiocloud.com
```

**راهنما:**
- اگر می‌خواهید پنل با HTTPS کار کند، `y` وارد کنید
- دامنه‌ای که برای پنل مدیریت می‌خواهید استفاده کنید را وارد کنید
- ایمیل خود را برای دریافت اطلاعات گواهینامه SSL وارد کنید
- **مهم**: قبل از نصب، DNS دامنه را به IP Master تنظیم کنید

### مرحله 4: تایید و شروع نصب

```
╔═══════════════════════════════════════════════════════════════╗
║                    خلاصه تنظیمات                             ║
╚═══════════════════════════════════════════════════════════════╝

  مکان: iran
  Registry Mirror: registry.haiocloud.com
  Master IP: 94.182.92.207:2280
  تعداد Workers: 2
    - Worker #1: 94.182.92.203:2280
    - Worker #2: 94.182.92.241:2280
  SSL: true
  Panel Domain: panel.haiocloud.com
  SSL Email: admin@haiocloud.com

آیا می‌خواهید نصب را شروع کنید؟ (y/n): 
```

اگر اطلاعات صحیح است، `y` را وارد کنید.

### مرحله 5: انتظار برای نصب

اسکریپت این کارها را به صورت خودکار انجام می‌دهد:

1. ✅ بررسی دسترسی SSH به تمام سرورها
2. ✅ نصب K3s روی Master Node
3. ✅ تنظیم Registry Mirror برای دور زدن تحریم‌ها
4. ✅ نصب K3s Agent روی Worker Nodes
5. ✅ اتصال Workerها به Master
6. ✅ نصب Traefik Ingress Controller
7. ✅ نصب cert-manager برای SSL
8. ✅ تنظیم Let's Encrypt

**زمان تقریبی:** 10-15 دقیقه

### مرحله 6: بررسی نتیجه

بعد از نصب، این پیام را خواهید دید:

```
==========================================
✓ نصب کلاستر با موفقیت انجام شد!
==========================================

اطلاعات کلاستر:
  - Master: 94.182.92.207
  - Workers: 2
  - Token: K1071234567890abcdef::server:1234567890abcdef
  - Panel URL: https://panel.haiocloud.com

برای افزودن Worker جدید از دستور زیر استفاده کنید:
  ./k8s-installer.sh add-worker <IP> <SSH_PORT>
```

---

## ➕ افزودن Worker Node جدید

اگر بعداً خواستید Worker جدید اضافه کنید:

```bash
sudo ./k8s-installer.sh add-worker 94.182.92.250 2280
```

**پارامترها:**
- پارامتر اول: IP سرور جدید
- پارامتر دوم: پورت SSH (اختیاری، پیش‌فرض 22)

**مثال‌ها:**

```bash
# افزودن Worker با پورت پیش‌فرض (22):
sudo ./k8s-installer.sh add-worker 192.168.1.100

# افزودن Worker با پورت سفارشی:
sudo ./k8s-installer.sh add-worker 94.182.92.250 2280
```

---

## 📊 بررسی وضعیت کلاستر

برای دیدن وضعیت کلاستر:

```bash
sudo ./k8s-installer.sh status
```

**خروجی نمونه:**

```
╔═══════════════════════════════════════════════════════════════╗
║                  وضعیت کلاستر Kubernetes                     ║
╚═══════════════════════════════════════════════════════════════╝

  Master Node: 94.182.92.207:2280
  Worker Nodes: 2
    - Worker #1: 94.182.92.203:2280
    - Worker #2: 94.182.92.241:2280

NAME       STATUS   ROLES                  AGE   VERSION
master     Ready    control-plane,master   10m   v1.28.5+k3s1
worker-1   Ready    <none>                 8m    v1.28.5+k3s1
worker-2   Ready    <none>                 7m    v1.28.5+k3s1
```

---

## 🔍 بررسی دستی کلاستر

بعد از نصب، می‌توانید با SSH به Master وصل شوید و دستورات kubectl را اجرا کنید:

```bash
# اتصال به Master:
ssh -p 2280 root@94.182.92.207

# بررسی Nodes:
kubectl get nodes

# بررسی Pods:
kubectl get pods -A

# بررسی Services:
kubectl get svc -A

# بررسی گواهینامه SSL:
kubectl get certificate -A
```

---

## 🛠 عیب‌یابی

### ❌ مشکل: دسترسی SSH ندارد

**خطا:**
```
✗ دسترسی SSH به Master برقرار نیست
```

**راه‌حل:**
```bash
# 1. بررسی کنید سرور روشن است:
ping 94.182.92.207

# 2. بررسی پورت SSH:
telnet 94.182.92.207 2280

# 3. تنظیم مجدد SSH Key:
ssh-copy-id -p 2280 root@94.182.92.207
```

---

### ❌ مشکل: Worker به Master متصل نمی‌شود

**علت احتمالی:** پورت 6443 بسته است

**راه‌حل:**

```bash
# روی Master Node:
ssh -p 2280 root@94.182.92.207

# باز کردن پورت 6443:
ufw allow 6443/tcp
```

---

### ❌ مشکل: SSL Certificate صادر نمی‌شود

**علت احتمالی:** DNS تنظیم نشده

**راه‌حل:**

```bash
# بررسی DNS:
nslookup panel.haiocloud.com

# باید به IP Master اشاره کند:
# Name: panel.haiocloud.com
# Address: 94.182.92.207
```

اگر DNS درست نیست، A Record را تنظیم کنید:

```
Type: A
Name: panel (یا @)
Value: 94.182.92.207
TTL: 300
```

بعد از تنظیم DNS، صبر کنید تا propagate شود (5-30 دقیقه).

---

### ❌ مشکل: Image Pull نمی‌شود

**علت احتمالی:** Registry Mirror کار نمی‌کند

**راه‌حل:**

```bash
# بررسی Registry Mirror:
curl -k https://registry.haiocloud.com/v2/_catalog

# باید لیست Images را نشان دهد:
# {"repositories":["library/mysql","library/wordpress",...]}
```

اگر خطا داد، بررسی کنید که Registry روشن باشد.

---

## 📝 فایل‌های مهم

### 🗂 فایل کانفیگ کلاستر

اطلاعات کلاستر در این مسیر ذخیره می‌شود:

```
/etc/k8s-installer/config.env
```

**محتوای نمونه:**

```bash
# Kubernetes Cluster Configuration
LOCATION="iran"
USE_REGISTRY_MIRROR="true"
REGISTRY_DOMAIN="registry.haiocloud.com"
MASTER_IP="94.182.92.207"
MASTER_SSH_PORT="2280"
WORKER_COUNT="2"
WORKER_IPS=(94.182.92.203 94.182.92.241)
WORKER_SSH_PORTS=(2280 2280)
ENABLE_SSL="true"
PANEL_DOMAIN="panel.haiocloud.com"
SSL_EMAIL="admin@haiocloud.com"
K3S_TOKEN="K1071234567890abcdef::server:1234567890abcdef"
```

---

### 📜 فایل لاگ

تمام عملیات در این لاگ ثبت می‌شود:

```
/var/log/k8s-installer.log
```

**مشاهده لاگ:**

```bash
tail -f /var/log/k8s-installer.log
```

---

## 💡 نکات مهم

### 🔐 امنیت

1. **تغییر پسورد Registry:**
   - در فایل اسکریپت، متغیر `REGISTRY_PASS` را تغییر دهید
   - پسورد قوی انتخاب کنید

2. **محدود کردن دسترسی SSH:**
   ```bash
   # فقط از IP مشخص SSH مجاز باشد:
   ufw allow from 1.2.3.4 to any port 2280
   ```

3. **استفاده از SSH Key:**
   - حتماً از SSH Key استفاده کنید
   - Password authentication را غیرفعال کنید

---

### ⚡ بهینه‌سازی

1. **تنظیم Resource Limits:**
   - برای Production، حتماً CPU و RAM کافی اختصاص دهید
   - حداقل برای Master: 4GB RAM, 2 CPU
   - حداقل برای Worker: 4GB RAM, 2 CPU

2. **استفاده از SSD:**
   - برای دیتابیس‌ها حتماً از SSD استفاده کنید
   - Performance به شدت بهتر می‌شود

3. **Backup منظم:**
   - از etcd بک‌آپ بگیرید
   - از PersistentVolumes بک‌آپ بگیرید

---

## ❓ سوالات متداول

### ❔ چند Worker می‌توانم داشته باشم؟

هیچ محدودیتی ندارد. می‌توانید به تعداد دلخواه Worker اضافه کنید.

---

### ❔ آیا می‌توانم بدون SSL نصب کنم؟

بله، در سوال SSL فعال‌سازی، `n` را انتخاب کنید.

---

### ❔ چطور کلاستر را حذف کنم؟

```bash
# روی هر Node:
/usr/local/bin/k3s-uninstall.sh  # Master
/usr/local/bin/k3s-agent-uninstall.sh  # Worker

# حذف فایل‌های کانفیگ:
rm -rf /etc/k8s-installer
rm -f /var/log/k8s-installer.log
```

---

### ❔ آیا می‌توانم از K8s به جای K3s استفاده کنم؟

این اسکریپت فعلاً فقط K3s را ساپورت می‌کند، اما K3s برای اکثر کاربردها کافی است.

---

### ❔ چطور kubectl را روی سیستم خودم نصب کنم؟

```bash
# Linux/Mac:
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

# کپی کردن kubeconfig از Master:
scp -P 2280 root@94.182.92.207:/etc/rancher/k3s/k3s.yaml ~/.kube/config

# تغییر IP در kubeconfig:
sed -i 's/127.0.0.1/94.182.92.207/g' ~/.kube/config

# تست:
kubectl get nodes
```

---

## 🎓 مراحل بعدی

بعد از نصب موفق کلاستر، می‌توانید:

1. **نصب Monitoring:**
   - Prometheus
   - Grafana
   - AlertManager

2. **نصب Storage:**
   - Longhorn
   - Rook-Ceph

3. **Deploy اولین App:**
   - WordPress
   - Nextcloud
   - GitLab

---

## 📞 پشتیبانی

اگر مشکلی دارید:

1. فایل `/var/log/k8s-installer.log` را بررسی کنید
2. دستور `kubectl get pods -A` را اجرا کنید
3. لاگ Podهای مشکل‌دار را چک کنید: `kubectl logs <pod-name> -n <namespace>`

---

## 🏆 موفق باشید!

حالا کلاستر Kubernetes شما آماده است! 🎉

می‌توانید شروع به Deploy کردن برنامه‌هایتان کنید.

برای راه‌اندازی پنل مدیریت، به فاز بعدی مراجعه کنید.
