#!/usr/bin/env bash
# =========================================================================
# بيت الصحافة (PressHouse) - اسكريبت النسخ الاحتياطي الدوري لـ Debian 13
# PressHouse Enterprise Platform - Automated Backup Script
# =========================================================================

set -e

APP_DIR="/Data/presshouse"
BACKUP_DIR="${APP_DIR}/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RETENTION_DAYS=30

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] بدء عملية النسخ الاحتياطي لمنصة بيت الصحافة..."

# 1. Backup SQLite Database
if [ -f "${APP_DIR}/database.sqlite" ]; then
  sqlite3 "${APP_DIR}/database.sqlite" ".backup '${BACKUP_DIR}/db_backup_${TIMESTAMP}.sqlite'"
  echo "✅ تم إنشاء نسخة احتياطية من قاعدة البيانات: db_backup_${TIMESTAMP}.sqlite"
fi

# 2. Backup Uploads Directory
if [ -d "${APP_DIR}/uploads" ]; then
  tar -czf "${BACKUP_DIR}/uploads_backup_${TIMESTAMP}.tar.gz" -C "${APP_DIR}" uploads
  echo "✅ تم إنشاء أرشيف النسخ الاحتياطي للمرفقات والصور: uploads_backup_${TIMESTAMP}.tar.gz"
fi

# 3. Backup Config File (.env)
if [ -f "${APP_DIR}/.env" ]; then
  cp "${APP_DIR}/.env" "${BACKUP_DIR}/env_backup_${TIMESTAMP}.env"
  chmod 600 "${BACKUP_DIR}/env_backup_${TIMESTAMP}.env"
  echo "✅ تم إخفاء ونقل نسخة من ملف المتغيرات .env"
fi

# 4. Retention Management - Delete backups older than RETENTION_DAYS
echo "تنظيف النسخ القديمة الأقدم من ${RETENTION_DAYS} يوماً..."
find "${BACKUP_DIR}" -type f -mtime +${RETENTION_DAYS} -delete

echo "[$(date)] اكتملت عملية النسخ الاحتياطي بنجاح!"
