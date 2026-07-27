#!/usr/bin/env bash
# =========================================================================
# بيت الصحافة (PressHouse) - اسكريبت التثبيت التلقائي المتقدم لـ Debian 13
# PressHouse Enterprise Platform - Debian 13 (Trixie) Auto-Installer
# =========================================================================

set -e

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=================================================================${NC}"
echo -e "${GREEN}   بيت الصحافة - نظام التثبيت والتهيئة التلقائية (Debian 13)${NC}"
echo -e "${GREEN}   PressHouse Platform - Automated Deployment for Debian 13${NC}"
echo -e "${BLUE}=================================================================${NC}\n"

# 1. Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[خطأ] يرجى تشغيل الاسكريبت كـ root أو باستخدام sudo${NC}"
  exit 1
fi

DOMAIN="ph-ye.org"
APP_DIR="/Data/presshouse"
NODE_VERSION="22"

echo -e "${YELLOW}[1/8] تحديث حزم النظام وتثبيت المتطلبات الأساسية...${NC}"
apt update && apt upgrade -y
apt install -y curl wget git build-essential python3 g++ make sqlite3 nginx ufw certbot python3-certbot-nginx fail2ban tar gzip

echo -e "${YELLOW}[2/8] تثبيت Node.js v${NODE_VERSION} LTS وتجهيز البيئة...${NC}"
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
  apt install -y nodejs
fi

echo -e "اصدار Node.js المثبت: $(node -v)"
echo -e "اصدار NPM المثبت: $(npm -v)"

# Install PM2 globally
npm install -g pm2 tsx

echo -e "${YELLOW}[3/8] إنشاء مجلدات المشروع وضبط الصلاحيات...${NC}"
mkdir -p "${APP_DIR}"
mkdir -p "${APP_DIR}/uploads"
mkdir -p "${APP_DIR}/backups"
mkdir -p "${APP_DIR}/logs"

# Ensure correct permissions
chmod -R 755 "${APP_DIR}"

echo -e "${YELLOW}[4/8] تثبيت حزم وتدابير المشروع (npm dependencies)...${NC}"
cd "${APP_DIR}"
if [ -f "package.json" ]; then
  npm install --production=false
fi

echo -e "${YELLOW}[5/8] إنتاج ملف البيئة .env وإعداد المفاتيح العشوائية...${NC}"
if [ ! -f "${APP_DIR}/.env" ]; then
  if [ -f "${APP_DIR}/.env.example" ]; then
    cp "${APP_DIR}/.env.example" "${APP_DIR}/.env"
    
    # Generate crypto secrets
    JWT_SEC=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    ENC_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    SES_SEC=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=${JWT_SEC}|g" "${APP_DIR}/.env"
    sed -i "s|ENCRYPTION_KEY=.*|ENCRYPTION_KEY=${ENC_KEY}|g" "${APP_DIR}/.env"
    sed -i "s|SESSION_SECRET=.*|SESSION_SECRET=${SES_SEC}|g" "${APP_DIR}/.env"
    
    echo -e "${GREEN}تم إنشاء ملف .env وتم توليد المفاتيح العشوائية بنجاح.${NC}"
  fi
fi

echo -e "${YELLOW}[6/8] بناء الواجهة الأمامية وإعداد السيرفر...${NC}"
npm run build

echo -e "${YELLOW}[7/8] إعداد خادم Nginx وجدار الحماية UFW...${NC}"
NGINX_CONF="/etc/nginx/sites-available/presshouse"

cat <<'EOF' > "${NGINX_CONF}"
# PressHouse Enterprise Platform - Nginx Reverse Proxy Config
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

    # Static uploads caching
    location /uploads/ {
        alias /Data/presshouse/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Node.js Application Proxy
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
EOF

ln -sf "${NGINX_CONF}" /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

# Configure Firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
echo "y" | ufw enable

echo -e "${YELLOW}[8/8] تشغيل الخدمة بواسطة PM2 وضبط البدء التلقائي...${NC}"
pm2 start src/server.ts --name "presshouse" --interpreter tsx || pm2 restart "presshouse"
pm2 save
pm2 startup systemd -u root --hp /root || true

echo -e "\n${BLUE}=================================================================${NC}"
echo -e "${GREEN}🎉 تم اكتكال تثبيت منصة بيت الصحافة بنجاح على Debian 13!${NC}"
echo -e "${BLUE}=================================================================${NC}"
echo -e "📌 المجلد الأساسي: ${APP_DIR}"
echo -e "📌 حالة الخدمة:     pm2 status"
echo -e "📌 سجلات النظام:   pm2 logs presshouse"
echo -e "📌 لتفعيل SSL شهادة الأمان المجانية عبر Certbot تشغيل:"
echo -e "   sudo certbot --nginx -d ph-ye.org -d www.ph-ye.org\n"
