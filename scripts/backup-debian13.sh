#!/usr/bin/env bash
# =========================================================================
# بيت الصحافة (PressHouse) - اسكريبت النسخ الاحتياطي الدوري لـ Debian 13 (PostgreSQL)
# PressHouse Enterprise Platform - Automated Backup Script
# =========================================================================

set -e

APP_DIR="/Data/presshouse"
BACKUP_DIR="${APP_DIR}/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RETENTION_DAYS=30

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] بدء عملية النسخ الاحتياطي لمنصة بيت الصحافة (PostgreSQL)..."

# Load environment variables if available
if [ -f "${APP_DIR}/.env" ]; then
  export $(grep -v '^#' "${APP_DIR}/.env" | xargs)
fi

# 1. Backup PostgreSQL Database
DB_NAME="${PGDATABASE:-presshouse_db}"
DB_USER="${PGUSER:-presshouse}"

if command -v pg_dump >/dev/null 2>&1; then
  sudo -u postgres pg_dump "${DB_NAME}" | gzip > "${BACKUP_DIR}/pg_dump_${TIMESTAMP}.sql.gz" || \
  pg_dump "${POSTGRES_URL:-postgresql://presshouse:presshouse_pass@localhost:5432/presshouse_db}" | gzip > "${BACKUP_DIR}/pg_dump_${TIMESTAMP}.sql.gz"
  echo "✅ تم إنشاء نسخة احتياطية من قاعدة بيانات PostgreSQL: pg_dump_${TIMESTAMP}.sql.gz"
else
  echo "⚠️ لم يتم العثور على أداة pg_dump، يُرجى التأكد من تثبيت postgresql-client."
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
