#!/usr/bin/env bash
# =========================================================================
# بيت الصحافة (PressHouse) - اسكريبت التحديث والتحديث الفوري لـ Debian 13
# PressHouse Enterprise Platform - One-Click Update & Deployment Script
# =========================================================================

set -e

APP_DIR="/Data/presshouse"

echo "========================================="
echo "   تحديث منصة بيت الصحافة (PressHouse)   "
echo "========================================="

cd "${APP_DIR}"

echo "[1/4] سحب التحديثات البرمجية من Git..."
git pull origin main || git pull origin master

echo "[2/4] تحديث حزم وتطبيقات Node.js..."
npm install

echo "[3/4] إعادة بناء ملفات الواجهة الأمامية (Vite Production Build)..."
npm run build

echo "[4/4] إعادة تحميل الخادم بسلاسة بدون توقف (Zero-Downtime Reload)..."
pm2 reload presshouse || pm2 restart presshouse

echo "========================================="
echo "✅ تم تحديث المنصة بنجاح وإعادة تشغيل الخادم!"
echo "========================================="
