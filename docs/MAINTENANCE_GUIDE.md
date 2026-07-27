# دليل الصيانة والتشغيل اليومي لسيرفر Debian 13
# PressHouse Enterprise Platform - Server Maintenance & Troubleshooting Guide

هذا المستند يتضمن التعليمات والإرشادات الإدارية لصيانة وتأمين مرافق ومكونات خادم **بيت الصحافة (PressHouse Enterprise Platform)** على **Debian 13 (Trixie)**.

---

## 📊 1. مراقبة حالة النظام والخادم (System Monitoring)

### فحص حالة عملية التطبيق (PM2 Status)
```bash
# عرض حالة الخدمة واستغلال المعالج والذاكرة
pm2 status

# استعراض السجلات الحية للتطبيق (Live Logs)
pm2 logs presshouse

# إعادة تشغيل التطبيق دون توقف (Zero-downtime)
pm2 reload presshouse
```

### فحص حالة سيرفر خادم الويب Nginx
```bash
sudo systemctl status nginx
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

---

## 💾 2. النسخ الاحتياطي والاستعادة (Backups & Disaster Recovery)

تُخزن النسخ الاحتياطية تلقائياً في المسار:
`/Data/presshouse/backups/`

### تشغيل النسخ الاحتياطي الفوري يدوياً
```bash
/Data/presshouse/scripts/backup-debian13.sh
```

### استعادة قاعدة البيانات من نسخة احتياطية (Restore SQLite)
```bash
# 1. إيقاف الخدمة المؤقت
pm2 stop presshouse

# 2. استبدال ملف قاعدة البيانات الحالي بالنسخة الاحتياطية المطلوب استعادتها
cp /Data/presshouse/backups/db_backup_YYYYMMDD_HHMMSS.sqlite /Data/presshouse/database.sqlite

# 3. إعادة تشغيل الخدمة
pm2 start presshouse
```

---

## 🔐 3. تجديد شهادات الأمان SSL (Certbot Auto-Renewal)

تتجدد شهادات SSL الصادرة من Let's Encrypt تلقائياً. للتأكد من عمل المجدل التلقائي:

```bash
# اختبار التجديد التلقائي لشهادة SSL (Dry-Run)
sudo certbot renew --dry-run
```

---

## 🛡️ 4. حل المشاكل الشائعة (Troubleshooting)

### مشكلة: تعذر الاتصال بقاعدة البيانات SQLite (`SQLITE_ERROR` أو قفل الملف)
**السبب**: وجود جلسة مفتوحة أو قفل على ملف `database.sqlite` بسبب تراكم الاتصالات أو نقص صلاحيات المجلد.
**الحل**:
```bash
sudo chmod 666 /Data/presshouse/database.sqlite
sudo chown -R $USER:$USER /Data/presshouse
pm2 restart presshouse
```

### مشكلة: خطأ في المنفذ `Port 3000 is already in use`
**السبب**: وجود عملية سابقة تستحوذ على المنفذ 3000.
**الحل**:
```bash
sudo lsof -i :3000
sudo kill -9 $(sudo lsof -t -i:3000)
pm2 restart presshouse
```

### مشكلة: خطأ عند رفع الملفات الكبيرة (502 Bad Gateway / 413 Request Entity Too Large)
**السبب**: قيود Nginx أو حجم الملف المتجاوز للحد.
**الحل**:
تأكد من وجود السطر التالي في ملف إعدادات Nginx `/etc/nginx/sites-available/presshouse`:
`client_max_body_size 50M;`
ثم نفّذ:
```bash
sudo nginx -t && sudo systemctl restart nginx
```

---

## 🧹 5. تنظيف الكاش والملفات المؤقتة (System Housekeeping)

```bash
# تنظيف مخزن الحزم التابع لـ NPM
npm cache clean --force

# تنظيف سجلات PM2 القديمة
pm2 flush

# تنظيف ملفات الـ build وإعادة البناء
npm run clean
npm run build
pm2 reload presshouse
```
