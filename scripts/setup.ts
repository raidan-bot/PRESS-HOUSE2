import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => rl.question(query, resolve));
};

const generateSecret = () => crypto.randomBytes(32).toString('hex');
const generateLongSecret = () => crypto.randomBytes(64).toString('hex');

async function setup() {
  console.log('\n=================================================================');
  console.log('   بيت الصحافة (PressHouse) - معالج الإعداد والتكوين الآلي');
  console.log('   PressHouse Enterprise Platform - Automated Setup Wizard');
  console.log('=================================================================\n');

  const envPath = path.join(process.cwd(), '.env');
  const examplePath = path.join(process.cwd(), '.env.example');

  if (!fs.existsSync(examplePath)) {
    console.error('Error: .env.example not found!');
    process.exit(1);
  }

  let envContent = fs.readFileSync(examplePath, 'utf8');

  console.log('Step 1: توليد المفاتيح الأمنية المشفرة تلقائياً...');
  
  const secrets = {
    JWT_SECRET: generateLongSecret(),
    ENCRYPTION_KEY: generateLongSecret(),
    SESSION_SECRET: generateLongSecret(),
    API_RATE_LIMIT_KEY: generateSecret(),
    WEBHOOK_SECRET: generateSecret(),
    CRON_SECRET: generateSecret(),
  };

  for (const [key, value] of Object.entries(secrets)) {
    envContent = envContent.replace(new RegExp(`${key}=.*`, 'g'), `${key}=${value}`);
  }
  console.log('✅ تم توليد وحفظ مفاتيح التشفير بنجاح.\n');

  console.log('Step 2: إعدادات النطاق والمؤسسة');
  const domain = await question('أدخل النطاق الرسمي (مثال ph-ye.org): ') || 'ph-ye.org';
  const rootEmail = await question('أدخل البريد الإلكتروني للآدمن الرئيسي (raidan@ph-ye.org): ') || 'raidan@ph-ye.org';
  const rootPass = await question('أدخل كلمة المرور للحساب الرئيسي (Root Admin Password): ');
  const defaultAdminPass = await question('أدخل كلمة مرور الآدمن الافتراضي للبذر (Default Admin Password): ');

  envContent = envContent.replace(/DOMAIN=.*/g, `DOMAIN=${domain}`);
  envContent = envContent.replace(/VITE_DOMAIN=.*/g, `VITE_DOMAIN=${domain}`);
  envContent = envContent.replace(/VITE_API_URL=.*/g, `VITE_API_URL=https://${domain}`);
  envContent = envContent.replace(/APP_URL=.*/g, `APP_URL=https://${domain}`);
  envContent = envContent.replace(/ROOT_ADMIN_EMAIL=.*/g, `ROOT_ADMIN_EMAIL=${rootEmail}`);
  if (rootPass) envContent = envContent.replace(/ROOT_ADMIN_PASSWORD=.*/g, `ROOT_ADMIN_PASSWORD=${rootPass}`);
  if (defaultAdminPass) envContent = envContent.replace(/DEFAULT_ADMIN_PASSWORD=.*/g, `DEFAULT_ADMIN_PASSWORD=${defaultAdminPass}`);

  console.log('\nStep 3: إعدادات الذكاء الاصطناعي والبريد الإلكتروني (اختياري)');
  const geminiKey = await question('مفتاح Gemini API Key (يمكن تركه فارغاً): ');
  const smtpUser = await question('حساب بريد SMTP (web@ph-ye.org): ') || 'web@ph-ye.org';
  const smtpPass = await question('كلمة مرور حساب البريد SMTP Password: ');

  if (geminiKey) envContent = envContent.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY=${geminiKey}`);
  envContent = envContent.replace(/SMTP_USER=.*/g, `SMTP_USER=${smtpUser}`);
  if (smtpPass) envContent = envContent.replace(/SMTP_PASSWORD=.*/g, `SMTP_PASSWORD=${smtpPass}`);
  envContent = envContent.replace(/SMTP_FROM=.*/g, `SMTP_FROM="بيت الصحافة <${smtpUser}>"`);

  fs.writeFileSync(envPath, envContent);

  console.log('\n=================================================================');
  console.log('✅ اكتمل الإعداد بنجاح!');
  console.log('تم حفظ التكوين في ملف .env');
  console.log('يمكنك الآن تشغيل المنصة في بيئة التطوير عبر: npm run dev');
  console.log('أو بناء النسخة الإنتاجية عبر: npm run build && npm start');
  console.log('=================================================================\n');

  rl.close();
}

setup().catch(console.error);
