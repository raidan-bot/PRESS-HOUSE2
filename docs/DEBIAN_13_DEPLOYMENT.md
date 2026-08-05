# دليل التثبيت والنشر الشامل على سيرفر Debian 13 (Trixie)
# PressHouse Enterprise Platform - Debian 13 Deployment Guide

هذا الدليل الفني يوضح خطوات تركيب ونشر منصة **بيت الصحافة (PressHouse Enterprise Platform)** على سيرفر يعمل بنظام **Debian 13 (Trixie)** في البيئة الإنتاجية.

---

## 📋 المتطلبات الأساسية للنظام (System Requirements)

- **نظام التشغيل**: Debian 13 (Trixie) 64-bit Minimal Server
- **المعالج (CPU)**: 2 Cores أو أعلى
- **الذاكرة العشوائية (RAM)**: 4 GB أو أعلى (يوصى بـ 8 GB للبيئات عالية الكثافة)
- **المساحة التخزينية (Disk)**: 40 GB NVMe / SSD
- **اسم النطاق (Domain Name)**: موجه نحو عنوان IP الخاص بالسيرفر (مثال: `ph-ye.org`, `www.ph-ye.org`)

---

## 🚀 الطرق المتاحة للتثبيت

تتوفر طريقتان للتركيب على سيرفر Debian 13:
1. **التثبيت التلقائي السريع بضغطة زر واحد (Automated Quick Setup)** - *طريقة مُوصى بها*
2. **التثبيت اليدوي بالتفصيل (Step-by-Step Manual Installation)**

---

## ⚡ 1. التثبيت التلقائي بضغطة زر (Quick Auto-Install)

قم بالاتصال بالسيرفر عبر SSH برتبة `root` وتنفيذ الأوامر التالية:

```bash
# 1. إنشاء مجلد المنصة والتأكد من الصلاحيات
mkdir -p /Data/presshouse
cd /Data/presshouse

# 2. جلب سورس كود المنصة من Git
git clone <رابط_الخيارات_أو_الريبو> .

# 3. منح صلاحيات التنفيذ لاسكريبت التثبيت
chmod +x scripts/install-debian13.sh

# 4. تشغيل اسكريبت التثبيت التلقائي
./scripts/install-debian13.sh
```

يقوم الاسكريبت تلقائياً بـ:
- تحديث النظام وتثبيت حزم `Node.js 22 LTS`, `PostgreSQL`, `Nginx`, `Certbot`, `Build-essential`, `Fail2ban`, `UFW`.
- تثبيت حزم Node.js وتوليد المفاتيح الأمنية المشفرة لملف `.env`.
- إعداد سيرفر Nginx كـ Reverse Proxy مع معايير أمان عالية والتخزين المؤقت للمرفقات.
- إعداد وتفعيل جدار الحماية UFW وتشغيل المنصة عبر `PM2` للبدء التلقائي مع إقلاع السيرفر.

---

## 🛠️ 2. التثبيت اليدوي بالتفصيل (Manual Installation Steps)

### الخطوة 1: تحديث حزم النظام وتثبيت التبعات الأساسية
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential python3 g++ make postgresql postgresql-contrib nginx ufw certbot python3-certbot-nginx fail2ban tar gzip
```

### الخطوة 2: تثبيت Node.js v22 LTS ومُدير العمليات PM2
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# التأكد من التثبيت
node -v # يجب أن يظهر v22.x.x
npm -v

# تثبيت PM2 و tsx عالمياً
sudo npm install -g pm2 tsx
```

### الخطوة 3: إعداد مجلدات المنصة والصلاحيات
```bash
sudo mkdir -p /Data/presshouse/uploads
sudo mkdir -p /Data/presshouse/backups
sudo mkdir -p /Data/presshouse/logs

# منح ملكية المجلد للمستخدم الحالي
sudo chown -R $USER:$USER /Data/presshouse
chmod -R 755 /Data/presshouse
```

### الخطوة 4: تثبيت مكتبات المشروع وإعداد ملف `.env`
```bash
cd /Data/presshouse

# تثبيت الحزم
npm install

# إعداد ملف البيئة
cp .env.example .env

# تشغيل معالج الإعداد الآلي لتوليد المفاتيح المشفرة وتحديد النطاق وحسابات الإدارة
npm run setup
```

### الخطوة 5: بناء النسخة الإنتاجية (Production Build)
```bash
npm run build
```

### الخطوة 6: إعداد خادم Nginx كـ Reverse Proxy
قم بإنشاء ملف إعدادات Nginx:
```bash
sudo nano /etc/nginx/sites-available/presshouse
```

ضع الإعدادات التالية:
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name ph-ye.org www.ph-ye.org api.ph-ye.org;

    client_max_body_size 50M;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Static media uploads
    location /uploads/ {
        alias /Data/presshouse/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Proxy requests to Node.js / Express Server
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90;
    }
}
```

تفعيل الإعدادات وإعادة تشغيل Nginx:
```bash
sudo ln -sf /etc/nginx/sites-available/presshouse /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### الخطوة 7: إصدار شهادات الأمان SSL (Let's Encrypt Free SSL)
```bash
sudo certbot --nginx -d ph-ye.org -d www.ph-ye.org
```

### الخطوة 8: تشغيل المنصة وضمان الاستمرارية عبر PM2
```bash
cd /Data/presshouse
pm2 start src/server.ts --name "presshouse" --interpreter tsx
pm2 save
pm2 startup
```

---

## 🔒 3. إعدادات الأمان وجدار الحماية (Security & Firewall)

تفعيل جدار الحماية UFW السماح فقط بالمنافذ الأساسية (SSH, HTTP, HTTPS):
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 🔄 4. التحديث والتطوير المستقبلي (System Updates)

لتحديث المنصة مستقبلاً من الريبو الخاص بك:
```bash
chmod +x /Data/presshouse/scripts/update-debian13.sh
/Data/presshouse/scripts/update-debian13.sh
```

أو يدوياً:
```bash
cd /Data/presshouse
git pull
npm install
npm run build
pm2 reload presshouse
```

---

## 💾 5. النسخ الاحتياطي الدوري (Automated Daily Backups)

جدولة النسخ الاحتياطي التلقائي لقاعدة البيانات والمرفقات عبر Cron:

```bash
chmod +x /Data/presshouse/scripts/backup-debian13.sh
crontab -e
```

أضف السطر التالي لتشغيل النسخ الاحتياطي يومياً الساعة 3:00 صباحاً:
```cron
0 3 * * * /Data/presshouse/scripts/backup-debian13.sh >> /Data/presshouse/logs/backup.log 2>&1
```

---

## 📞 الدعم والصيانة
لأي استفسارات أو دعم فني يرجى التواصل مع فريق الإدارة التقنية لمؤسسة بيت الصحافة (`raidan@ph-ye.org`).
