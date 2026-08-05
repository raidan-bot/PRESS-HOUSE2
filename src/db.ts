import path from 'path';
import fs from 'fs';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const usePostgres = true;
export const db: any = null;

const pgConnectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || 'postgresql://presshouse:presshouse_pass@localhost:5432/presshouse_db';

console.log('PressHouse: Initializing Pure PostgreSQL Database Connection...');

export const pgPool = new Pool({
  connectionString: pgConnectionString,
  ssl: pgConnectionString.includes('sslmode=') || (process.env.NODE_ENV === 'production' && !pgConnectionString.includes('localhost') && !pgConnectionString.includes('127.0.0.1'))
    ? { rejectUnauthorized: false }
    : false,
  connectionTimeoutMillis: 5000,
  max: 20
});

function transformSqlForPg(sql: string): string {
  let pgSql = sql;
  
  // 1. Replace MySQL backticks with double quotes for column/table identifiers
  pgSql = pgSql.replace(/`([a-zA-Z0-9_]+)`/g, '"$1"');

  // 2. Convert ? positional placeholders to PostgreSQL $1, $2, $3...
  let pCount = 1;
  let inString = false;
  let outSql = '';
  for (let i = 0; i < pgSql.length; i++) {
    if (pgSql[i] === "'") inString = !inString;
    if (pgSql[i] === '?' && !inString) {
      outSql += `$${pCount++}`;
    } else {
      outSql += pgSql[i];
    }
  }
  pgSql = outSql;

  // 3. For INSERT statements without RETURNING clause, append RETURNING *
  const trimmedUpper = pgSql.trim().toUpperCase();
  if (trimmedUpper.startsWith('INSERT INTO') && !trimmedUpper.includes('RETURNING')) {
    pgSql += ' RETURNING *';
  }

  return pgSql;
}

// Fallback state when PostgreSQL server is offline in sandbox/preview
const memoryStore: Record<string, any[]> = {
  institution_identity: [
    { id: 1, name_ar: 'بيت الصحافة - اليمن', name_en: 'Press House - Yemen', description_ar: 'مؤسسة إعلامية غير حكومية مستقلة', description_en: 'Independent non-governmental media organization' }
  ],
  site_settings: [
    {
      id: 1,
      siteName: JSON.stringify({ ar: 'بيت الصحافة - اليمن', en: 'Press House - Yemen' }),
      siteDescription: JSON.stringify({ ar: 'مؤسسة إعلامية مستقلة', en: 'Independent Media Institution' }),
      primaryColor: '#0f172a',
      maintenanceMode: 0,
      aiEnabled: 1,
      address: JSON.stringify({ ar: 'صنعاء، اليمن', en: 'Sanaa, Yemen' }),
      socialLinks: JSON.stringify({ facebook: '', twitter: '', instagram: '', youtube: '' }),
      seoTitle: JSON.stringify({ ar: 'بيت الصحافة - اليمن', en: 'Press House - Yemen' }),
      seoDescription: JSON.stringify({ ar: 'مؤسسة إعلامية غير حكومية مستقلة', en: 'Independent non-governmental media organization' }),
      seoKeywords: JSON.stringify({ ar: 'صحافة, اليمن, إعلام', en: 'journalism, yemen, media' })
    }
  ],
  users: [
    { uid: 'admin_1', email: 'admin@ph-ye.org', displayName: 'المدير العام', role: 'root' }
  ],
  membership_tiers: [
    { id: 'free', name_ar: 'عضوية مجانية', name_en: 'Free Membership', description_ar: 'عضوية أساسية للوصول للأخبار العامة والنشرة البريدية', price: 0, benefits_ar: '["الاشتراك بالنشرة الإخبارية","الوصول للأخبار العامة"]' },
    { id: 'student', name_ar: 'عضوية طالب', name_en: 'Student Membership', description_ar: 'مخصصة لطلاب الإعلام والناشطين لتلقي الإشعارات والفرص', price: 0, benefits_ar: '["الاشتراك بالنشرة الإخبارية","التسجيل في دورات الأكاديمية مجاناً"]' },
    { id: 'journalist', name_ar: 'عضوية صحفي محترف', name_en: 'Professional Journalist', description_ar: 'تتطلب إثبات المهنة، تتيح الانضمام لنظام رصد الانتهاكات وخدمات الدعم', price: 0, benefits_ar: '["الوصول الكامل للأخبار","الدعم القانوني والاستشاري الكامل"]' }
  ],
  articles: [],
  violations: [],
  jobs: [],
  tenders: [],
  courses: [],
  projects: [],
  events: [],
  media: [],
  media_albums: [],
  hero_slides: [],
  page_content: []
};

function queryMemoryFallback(sql: string, params: any[] = []) {
  const upper = sql.trim().toUpperCase();
  
  let tableName = 'articles';
  const fromMatch = sql.match(/FROM\s+["`]?([a-zA-Z0-9_]+)["`]?/i);
  const intoMatch = sql.match(/INTO\s+["`]?([a-zA-Z0-9_]+)["`]?/i);
  const updateMatch = sql.match(/UPDATE\s+["`]?([a-zA-Z0-9_]+)["`]?/i);

  if (fromMatch) tableName = fromMatch[1];
  else if (intoMatch) tableName = intoMatch[1];
  else if (updateMatch) tableName = updateMatch[1];

  if (!memoryStore[tableName]) {
    memoryStore[tableName] = [];
  }

  if (upper.includes('SELECT COUNT(*)')) {
    return [[{ count: memoryStore[tableName].length }], null];
  }

  if (upper.startsWith('SELECT') || upper.startsWith('WITH')) {
    let rows = [...memoryStore[tableName]];
    if (upper.includes('LIMIT 1')) {
      return [rows.slice(0, 1), null];
    }
    return [rows, null];
  }

  if (upper.startsWith('INSERT')) {
    const newId = 'id_' + Date.now();
    const newRow = { id: newId, uid: newId, createdAt: new Date().toISOString() };
    memoryStore[tableName].push(newRow);
    return [{ insertId: newId, affectedRows: 1, rows: [newRow] }, null];
  }

  if (upper.startsWith('UPDATE') || upper.startsWith('DELETE')) {
    return [{ insertId: null, affectedRows: 1, rows: [] }, null];
  }

  return [[], null];
}

export const pool = {
  query: async (sql: string, params: any[] = []) => {
    const pgSql = transformSqlForPg(sql);
    try {
      const result = await pgPool.query(pgSql, params);
      const trimmedUpper = sql.trim().toUpperCase();
      if (trimmedUpper.startsWith('SELECT') || trimmedUpper.startsWith('WITH') || trimmedUpper.startsWith('EXPLAIN')) {
        return [result.rows, null];
      } else {
        const firstRow = result.rows && result.rows[0];
        const insertId = firstRow ? (firstRow.id || firstRow.uid || null) : null;
        return [{ insertId, affectedRows: result.rowCount, rows: result.rows }, null];
      }
    } catch (err: any) {
      if (err.code === 'ECONNREFUSED' || err.message?.includes('connect ECONNREFUSED') || err.message?.includes('Connection terminated')) {
        return queryMemoryFallback(sql, params);
      }
      console.error('PostgreSQL Query Error:', err.message);
      console.error('Executing SQL:', pgSql);
      throw err;
    }
  },
  execute: async (sql: string, params: any[] = []) => {
    return pool.query(sql, params);
  },
  getConnection: async () => {
    try {
      const client = await pgPool.connect();
      return {
        query: async (sql: string, params: any[] = []) => {
          const pgSql = transformSqlForPg(sql);
          try {
            const result = await client.query(pgSql, params);
            const trimmedUpper = sql.trim().toUpperCase();
            if (trimmedUpper.startsWith('SELECT') || trimmedUpper.startsWith('WITH') || trimmedUpper.startsWith('EXPLAIN')) {
              return [result.rows, null];
            } else {
              const firstRow = result.rows && result.rows[0];
              const insertId = firstRow ? (firstRow.id || firstRow.uid || null) : null;
              return [{ insertId, affectedRows: result.rowCount, rows: result.rows }, null];
            }
          } catch (err: any) {
            if (err.code === 'ECONNREFUSED' || err.message?.includes('connect ECONNREFUSED')) {
              return queryMemoryFallback(sql, params);
            }
            console.error('PostgreSQL Transaction Client Error:', err.message);
            throw err;
          }
        },
        release: () => client.release()
      };
    } catch (err: any) {
      return {
        query: async (sql: string, params: any[] = []) => queryMemoryFallback(sql, params),
        release: () => {}
      };
    }
  }
};

export default pool;

export async function initPgSchema() {
  console.log('PressHouse: Verifying PostgreSQL database schemas & tables...');
  try {
    // 1. Users
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "uid" VARCHAR(255) PRIMARY KEY,
        "email" VARCHAR(255) NOT NULL UNIQUE,
        "password_hash" TEXT,
        "displayName" VARCHAR(255),
        "photoURL" TEXT,
        "role" VARCHAR(50) NOT NULL DEFAULT 'viewer',
        "googleId" VARCHAR(255) UNIQUE,
        "linkedinId" VARCHAR(255) UNIQUE,
        "department_id" INTEGER,
        "team_id" INTEGER,
        "system_role_id" INTEGER,
        "disabled" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Articles
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "articles" (
        "id" VARCHAR(255) PRIMARY KEY,
        "title" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "category" VARCHAR(100) NOT NULL,
        "authorId" VARCHAR(255),
        "status" VARCHAR(50) NOT NULL DEFAULT 'draft',
        "language" VARCHAR(10) NOT NULL DEFAULT 'ar',
        "mainImage" TEXT,
        "show_in_slider" INTEGER DEFAULT 0,
        "slider_caption" TEXT,
        "slider_button_text" TEXT,
        "slider_image" TEXT,
        "seo" TEXT,
        "views" INTEGER DEFAULT 0,
        "engagement" INTEGER DEFAULT 0,
        "access_tier" VARCHAR(50) DEFAULT 'public',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Violations
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "violations" (
        "id" VARCHAR(255) PRIMARY KEY,
        "reporterName" VARCHAR(255),
        "reporterPhone" VARCHAR(255),
        "reporterType" VARCHAR(255),
        "reporterRelation" VARCHAR(255),
        "victimName" VARCHAR(255),
        "victimInstitution" VARCHAR(255),
        "victimPenName" VARCHAR(255),
        "victimSocials" TEXT,
        "victimPhone" VARCHAR(255),
        "governorate" VARCHAR(255),
        "district" VARCHAR(255),
        "date" TIMESTAMP,
        "perpetrator" VARCHAR(255),
        "type" VARCHAR(255),
        "violationReason" TEXT,
        "description" TEXT,
        "evidenceTypes" TEXT,
        "evidenceLinks" TEXT,
        "needs" TEXT,
        "privacyPolicy" VARCHAR(255),
        "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
        "latitude" REAL,
        "longitude" REAL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Jobs & Applications
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "jobs" (
        "id" VARCHAR(255) PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "requirements" TEXT NOT NULL,
        "deadline" TIMESTAMP,
        "status" VARCHAR(50) NOT NULL DEFAULT 'open',
        "show_in_slider" INTEGER DEFAULT 0,
        "slider_caption" TEXT,
        "slider_button_text" TEXT,
        "slider_image" TEXT,
        "seo" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "job_applications" (
        "id" VARCHAR(255) PRIMARY KEY,
        "jobTitle" VARCHAR(255),
        "fullName" VARCHAR(255),
        "email" VARCHAR(255),
        "phone" VARCHAR(255),
        "coverLetter" TEXT,
        "cvName" VARCHAR(255),
        "portfolioUrl" TEXT,
        "linkedInUrl" TEXT,
        "user_uid" VARCHAR(255),
        "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Tenders
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "tenders" (
        "id" VARCHAR(255) PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "documents" TEXT,
        "deadline" TIMESTAMP,
        "status" VARCHAR(50) NOT NULL DEFAULT 'open',
        "show_in_slider" INTEGER DEFAULT 0,
        "slider_caption" TEXT,
        "slider_button_text" TEXT,
        "slider_image" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Courses & Applications
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "courses" (
        "id" VARCHAR(255) PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "trainer" TEXT NOT NULL,
        "applicationDeadline" TIMESTAMP,
        "applicationUrl" TEXT,
        "announcementImage" TEXT,
        "videos" TEXT,
        "isLive" INTEGER DEFAULT 0,
        "liveUrl" TEXT,
        "streamKey" VARCHAR(255),
        "streamUrl" TEXT,
        "status" VARCHAR(50) NOT NULL DEFAULT 'active',
        "show_in_slider" INTEGER DEFAULT 0,
        "slider_caption" TEXT,
        "slider_button_text" TEXT,
        "slider_image" TEXT,
        "seo" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "course_applications" (
        "id" VARCHAR(255) PRIMARY KEY,
        "course_id" VARCHAR(255) NOT NULL,
        "user_uid" VARCHAR(255),
        "fullName" VARCHAR(255),
        "email" VARCHAR(255),
        "phone" VARCHAR(255),
        "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "academy_applications" (
        "id" VARCHAR(255) PRIMARY KEY,
        "course_id" VARCHAR(255) NOT NULL,
        "user_uid" VARCHAR(255),
        "fullName" VARCHAR(255),
        "email" VARCHAR(255),
        "phone" VARCHAR(255),
        "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Projects
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "projects" (
        "id" VARCHAR(255) PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "image" TEXT,
        "status" VARCHAR(50) NOT NULL DEFAULT 'ongoing',
        "fundingGoal" NUMERIC(12,2),
        "currentFunding" NUMERIC(12,2),
        "isFeatured" INTEGER DEFAULT 0,
        "show_in_slider" INTEGER DEFAULT 0,
        "slider_caption" TEXT,
        "slider_button_text" TEXT,
        "slider_image" TEXT,
        "seo" TEXT,
        "partner_id" VARCHAR(255),
        "donor_id" VARCHAR(255),
        "beneficiaries_count" INTEGER DEFAULT 0,
        "start_date" TIMESTAMP,
        "end_date" TIMESTAMP,
        "goals" TEXT,
        "activities" TEXT,
        "deliverables" TEXT,
        "location_governorate" TEXT,
        "location_district" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 8. Events
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "events" (
        "id" VARCHAR(255) PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "event_date" TIMESTAMP,
        "location" TEXT NOT NULL,
        "image" TEXT,
        "status" VARCHAR(50) NOT NULL DEFAULT 'upcoming',
        "isLive" INTEGER DEFAULT 0,
        "liveStreamUrl" TEXT,
        "streamKey" VARCHAR(255),
        "streamUrl" TEXT,
        "show_in_slider" INTEGER DEFAULT 0,
        "slider_caption" TEXT,
        "slider_button_text" TEXT,
        "slider_image" TEXT,
        "media" TEXT,
        "seo" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 9. Menus
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "menus" (
        "id" SERIAL PRIMARY KEY,
        "location" VARCHAR(50) NOT NULL,
        "title" TEXT NOT NULL,
        "icon" VARCHAR(255),
        "path" VARCHAR(255) NOT NULL,
        "order" INTEGER DEFAULT 0,
        "isActive" INTEGER DEFAULT 1,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 10. Site Settings
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "site_settings" (
        "id" SERIAL PRIMARY KEY,
        "siteName" TEXT,
        "logo" TEXT,
        "favicon" TEXT,
        "primaryColor" VARCHAR(50),
        "secondaryColor" VARCHAR(50),
        "fontFamily" VARCHAR(50),
        "socialLinks" TEXT,
        "contactEmail" VARCHAR(255),
        "contactPhone" VARCHAR(255),
        "address" TEXT,
        "sshPublicKey" TEXT,
        "tunnelingEnabled" INTEGER DEFAULT 0,
        "livestream" TEXT,
        "sliderAutoplayDelay" INTEGER DEFAULT 8000,
        "sliderTransitionSpeed" INTEGER DEFAULT 1000,
        "seoTitle" TEXT,
        "seoDescription" TEXT,
        "seoKeywords" TEXT,
        "ogDefaultImage" TEXT,
        "ogSiteName" TEXT,
        "ogType" VARCHAR(50) DEFAULT 'website',
        "googleVerification" TEXT,
        "bingVerification" TEXT,
        "aiEnabled" INTEGER DEFAULT 1,
        "aiModel" TEXT DEFAULT 'nvidia/qwen-2.5-coder-32b-instruct',
        "aiBaseUrl" TEXT DEFAULT 'https://integrate.api.nvidia.com/v1',
        "aiApiKey" TEXT,
        "aiTemperature" REAL DEFAULT 0.3,
        "aiMaxTokens" INTEGER DEFAULT 1524,
        "aiSystemInstruction" TEXT,
        "aiProvider" TEXT DEFAULT 'openai',
        "smtpHost" TEXT,
        "smtpPort" INTEGER,
        "smtpUser" TEXT,
        "smtpPass" TEXT,
        "smtpFrom" TEXT,
        "maintenanceMode" INTEGER DEFAULT 0,
        "maintenanceMessage" TEXT
      );
    `);

    // 11. Page Content
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "page_content" (
        "id" SERIAL PRIMARY KEY,
        "page_name" VARCHAR(255) NOT NULL,
        "section_name" VARCHAR(255) NOT NULL,
        "content" TEXT NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "page_section_unique" UNIQUE ("page_name", "section_name")
      );
    `);

    // 12. Media & Albums
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "media_albums" (
        "id" SERIAL PRIMARY KEY,
        "name_ar" VARCHAR(255) NOT NULL,
        "name_en" VARCHAR(255),
        "description_ar" TEXT,
        "description_en" TEXT,
        "type" VARCHAR(50) DEFAULT 'mixed',
        "project_id" VARCHAR(255),
        "event_id" INTEGER,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "media" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(255) NOT NULL,
        "url" TEXT NOT NULL,
        "type" VARCHAR(100),
        "size" INTEGER,
        "uploadedBy" VARCHAR(255),
        "album_id" INTEGER,
        "alt_text" TEXT,
        "photographer" TEXT,
        "description" TEXT,
        "extracted_text" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 13. Hero Slides
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "hero_slides" (
        "id" VARCHAR(255) PRIMARY KEY,
        "title" TEXT,
        "subtitle" TEXT,
        "description" TEXT,
        "mediaType" VARCHAR(50),
        "mediaUrl" TEXT,
        "animationType" VARCHAR(50),
        "textAnimation" VARCHAR(50) DEFAULT 'slide-up',
        "titleSize" VARCHAR(100) DEFAULT 'text-4xl md:text-6xl lg:text-7xl',
        "subtitleSize" VARCHAR(100) DEFAULT 'text-xs',
        "descriptionSize" VARCHAR(100) DEFAULT 'text-lg md:text-xl',
        "buttonSize" VARCHAR(100) DEFAULT 'px-8 py-4',
        "overlayOpacity" INTEGER DEFAULT 60,
        "textAlign" VARCHAR(50) DEFAULT 'left',
        "primaryButton" TEXT,
        "secondaryButton" TEXT,
        "order" INTEGER DEFAULT 0,
        "isActive" INTEGER DEFAULT 1,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 14. Subscribers, Newsletter, Telegram
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "subscribers" (
        "id" SERIAL PRIMARY KEY,
        "email" VARCHAR(255) NOT NULL UNIQUE,
        "source" VARCHAR(255),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "newsletter_history" (
        "id" SERIAL PRIMARY KEY,
        "subject" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "sent_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "recipientCount" INTEGER
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "authorized_telegram_users" (
        "id" SERIAL PRIMARY KEY,
        "chatId" VARCHAR(255) UNIQUE NOT NULL,
        "username" VARCHAR(255),
        "displayName" VARCHAR(255),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 15. Institution Identity
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "institution_identity" (
        "id" INTEGER PRIMARY KEY DEFAULT 1,
        "name_ar" TEXT,
        "name_en" TEXT,
        "description_ar" TEXT,
        "description_en" TEXT,
        "vision_ar" TEXT,
        "vision_en" TEXT,
        "mission_ar" TEXT,
        "mission_en" TEXT,
        "goals" TEXT,
        "work_fields" TEXT,
        "logo_main" TEXT,
        "logo_colored" TEXT,
        "logo_dark" TEXT,
        "logo_white" TEXT,
        "favicon" TEXT,
        "primaryColor" TEXT,
        "secondaryColor" TEXT,
        "accentColor" TEXT,
        "fontArPrimary" TEXT,
        "fontArSecondary" TEXT,
        "fontEnPrimary" TEXT,
        "fontEnSecondary" TEXT
      );
    `);

    // Seed default identity if empty
    const resId = await pgPool.query('SELECT id FROM "institution_identity" WHERE id = 1');
    if (resId.rows.length === 0) {
      await pgPool.query(`
        INSERT INTO "institution_identity" ("id", "name_ar", "name_en", "description_ar", "description_en")
        VALUES (1, 'بيت الصحافة - اليمن', 'Press House - Yemen', 'مؤسسة إعلامية غير حكومية مستقلة', 'Independent non-governmental media organization')
      `);
    }

    // 16. Employees, Board, Partners, Programs
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "employees" (
        "id" VARCHAR(255) PRIMARY KEY,
        "full_name" TEXT NOT NULL,
        "employee_id" VARCHAR(50),
        "position" TEXT,
        "department" TEXT,
        "photo_url" TEXT,
        "email" TEXT,
        "phone" TEXT,
        "status" VARCHAR(50) DEFAULT 'active'
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "board_members" (
        "id" VARCHAR(255) PRIMARY KEY,
        "full_name" TEXT NOT NULL,
        "position" TEXT,
        "photo_url" TEXT,
        "bio" TEXT,
        "sort_order" INTEGER DEFAULT 0,
        "category" VARCHAR(50) DEFAULT 'leadership'
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "partners" (
        "id" VARCHAR(255) PRIMARY KEY,
        "name" TEXT NOT NULL,
        "type" VARCHAR(50) DEFAULT 'donor',
        "logo" TEXT,
        "country" TEXT,
        "website" TEXT,
        "contact_person" TEXT
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "programs" (
        "id" VARCHAR(255) PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "imageurl" TEXT,
        "icon" TEXT,
        "category" VARCHAR(50) DEFAULT 'training'
      );
    `);

    // 17. Departments, Teams, Roles, Tasks, Sectors
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "departments" (
        "id" SERIAL PRIMARY KEY,
        "name_ar" TEXT NOT NULL,
        "name_en" TEXT,
        "description" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "teams" (
        "id" SERIAL PRIMARY KEY,
        "name_ar" TEXT NOT NULL,
        "name_en" TEXT,
        "department_id" INTEGER,
        "description" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "system_roles" (
        "id" SERIAL PRIMARY KEY,
        "name_ar" TEXT NOT NULL,
        "name_en" TEXT,
        "role_key" VARCHAR(50) UNIQUE,
        "permissions" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const resRole = await pgPool.query('SELECT id FROM "system_roles" WHERE role_key = \'super_admin\'');
    if (resRole.rows.length === 0) {
      await pgPool.query(`
        INSERT INTO "system_roles" ("name_ar", "name_en", "role_key", "permissions")
        VALUES ('مدير نظام', 'Super Admin', 'super_admin', '["all"]')
      `);
    }

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "tasks" (
        "id" SERIAL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "assigned_to" TEXT,
        "created_by" TEXT,
        "project_id" VARCHAR(255),
        "program_id" VARCHAR(255),
        "sector_id" VARCHAR(255),
        "due_date" TIMESTAMP,
        "status" VARCHAR(50) DEFAULT 'pending',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "sectors" (
        "id" VARCHAR(255) PRIMARY KEY,
        "name_ar" TEXT NOT NULL,
        "name_en" TEXT,
        "description_ar" TEXT,
        "description_en" TEXT,
        "image" TEXT,
        "icon" TEXT,
        "color" TEXT,
        "sort_order" INTEGER DEFAULT 0,
        "status" VARCHAR(50) DEFAULT 'published'
      );
    `);

    // 18. Cinema Shows & Videos
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "cinema_shows" (
        "id" VARCHAR(255) PRIMARY KEY,
        "title" TEXT NOT NULL,
        "director" TEXT,
        "duration" VARCHAR(50),
        "show_date" TIMESTAMP,
        "location" TEXT,
        "synopsis" TEXT,
        "poster_url" TEXT,
        "trailer_url" TEXT,
        "show_in_slider" INTEGER DEFAULT 0,
        "slider_caption" TEXT,
        "slider_button_text" TEXT,
        "slider_image" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "videos" (
        "id" VARCHAR(255) PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "url" TEXT NOT NULL,
        "thumbnail" TEXT,
        "category" VARCHAR(100),
        "tags" TEXT,
        "views" INTEGER DEFAULT 0,
        "likes" INTEGER DEFAULT 0,
        "duration" VARCHAR(50),
        "status" VARCHAR(50) DEFAULT 'published',
        "authorId" VARCHAR(255),
        "show_in_slider" INTEGER DEFAULT 0,
        "slider_caption" TEXT,
        "slider_button_text" TEXT,
        "slider_image" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "feedback" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT,
        "email" TEXT,
        "rating" INTEGER,
        "feedback_type" VARCHAR(50) DEFAULT 'general',
        "item_id" TEXT,
        "comment" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 19. Media Products, API Keys, API Logs
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "media_products" (
        "id" VARCHAR(255) PRIMARY KEY,
        "division" VARCHAR(50) NOT NULL,
        "contentType" VARCHAR(50) NOT NULL,
        "title" TEXT NOT NULL,
        "slug" VARCHAR(255) NOT NULL UNIQUE,
        "metadata" TEXT NOT NULL,
        "status" VARCHAR(20) DEFAULT 'draft' NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "api_keys" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(255) NOT NULL,
        "token" VARCHAR(255) UNIQUE NOT NULL,
        "role" VARCHAR(50) DEFAULT 'publisher',
        "scopes" VARCHAR(255) DEFAULT 'articles,reports,violations',
        "isActive" INTEGER DEFAULT 1,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "lastUsedAt" TIMESTAMP
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "api_logs" (
        "id" SERIAL PRIMARY KEY,
        "api_key_id" INTEGER,
        "endpoint" VARCHAR(255) NOT NULL,
        "method" VARCHAR(50) NOT NULL,
        "status" INTEGER,
        "ipAddress" VARCHAR(50),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 20. Podcasts & Episodes
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "podcasts" (
        "id" SERIAL PRIMARY KEY,
        "title_ar" TEXT NOT NULL,
        "title_en" TEXT,
        "description_ar" TEXT,
        "description_en" TEXT,
        "cover_url" TEXT,
        "host" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "podcast_episodes" (
        "id" SERIAL PRIMARY KEY,
        "podcast_id" INTEGER,
        "title_ar" TEXT NOT NULL,
        "title_en" TEXT,
        "description_ar" TEXT,
        "description_en" TEXT,
        "audio_url" TEXT,
        "duration" TEXT,
        "publish_date" TEXT,
        "views" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 21. Social Reels & Memberships
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "social_reels" (
        "id" SERIAL PRIMARY KEY,
        "url" TEXT NOT NULL,
        "title" TEXT,
        "isActive" INTEGER DEFAULT 1,
        "sort_order" INTEGER DEFAULT 0,
        "isBroken" INTEGER DEFAULT 0,
        "lastChecked" TIMESTAMP,
        "errorMessage" TEXT,
        "type" VARCHAR(20) DEFAULT 'social',
        "thumbnail" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "membership_tiers" (
        "id" VARCHAR(255) PRIMARY KEY,
        "name_ar" VARCHAR(255) NOT NULL,
        "name_en" VARCHAR(255) NOT NULL,
        "description_ar" TEXT,
        "description_en" TEXT,
        "price" REAL DEFAULT 0,
        "benefits_ar" TEXT,
        "benefits_en" TEXT,
        "status" VARCHAR(50) DEFAULT 'active',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const resTiers = await pgPool.query('SELECT COUNT(*) as count FROM "membership_tiers"');
    if (resTiers.rows && parseInt(resTiers.rows[0].count) === 0) {
      const defaultTiers = [
        ['free', 'عضوية مجانية', 'Free Membership', 'عضوية أساسية للوصول للأخبار العامة والنشرة البريدية', 'Basic membership for access to public news and newsletters', 0, '["الاشتراك بالنشرة الإخبارية","الوصول للأخبار العامة"]', '["Newsletter subscription","Access to public news"]'],
        ['student', 'عضوية طالب', 'Student Membership', 'مخصصة لطلاب الإعلام والناشطين لتلقي الإشعارات والفرص', 'For journalism students and activists to receive opportunities', 0, '["الاشتراك بالنشرة الإخبارية","الوصول للأخبار والتقارير الحصرية","التسجيل في دورات الأكاديمية مجاناً"]', '["Newsletter subscription","Access to exclusive news and reports","Register in academy courses for free"]'],
        ['journalist', 'عضوية صحفي محترف', 'Professional Journalist', 'تتطلب إثبات المهنة، تتيح الانضمام لنظام رصد الانتهاكات وخدمات الدعم وحضور الفعاليات الخاصة', 'Requires proof of profession, allows joining the observatory, aid services, and special events', 0, '["الوصول الكامل للأخبار والتقارير والتحليلات","الدعم القانوني والاستشاري الكامل","أولوية التسجيل في برامج الأكاديمية","لوحة حصرية للصحفيين"]', '["Full access to news, reports, and analytics","Full legal and consultative support","Priority in academy enrollment","Exclusive panel for journalists"]'],
        ['expert', 'خبير إعلامي', 'Media Expert', 'للصحفيين ذوي الخبرة الطويلة والاستشاريين والمؤسسات الأكاديمية الشريكة', 'For experienced journalists, consultants, and partner academic institutions', 0, '["تقديم استشارات وتدريبات بالأكاديمية","المشاركة في إعداد التقارير السنوية","دعوات حصرية لندوات صناعة القرار"]', '["Provide consulting and academy training","Participate in drafting annual reports","Exclusive invitations to decision-making seminars"]'],
        ['institution', 'عضوية مؤسسات شريكة', 'Partner Institution', 'للمؤسسات الحقوقية والإعلامية للتنسيق المشترك ونشر الوظائف والمناقصات', 'For human rights and media organizations to publish jobs, tenders, and co-advocate', 0, '["نشر إعلانات الوظائف والمناقصات","تنسيق حملات مناصرة مشتركة","الوصول لقاعدة بيانات التقارير والانتهاكات المصنفة"]', '["Publish job openings and tenders","Coordinate joint advocacy campaigns","Access to categorized reports and violation databases"]']
      ];
      for (const [id, nameAr, nameEn, descAr, descEn, price, benefitsAr, benefitsEn] of defaultTiers) {
        await pgPool.query('INSERT INTO "membership_tiers" ("id", "name_ar", "name_en", "description_ar", "description_en", "price", "benefits_ar", "benefits_en") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [id, nameAr, nameEn, descAr, descEn, price, benefitsAr, benefitsEn]);
      }
    }

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "user_memberships" (
        "id" SERIAL PRIMARY KEY,
        "user_uid" VARCHAR(255) NOT NULL,
        "tier_id" VARCHAR(255) NOT NULL,
        "status" VARCHAR(50) DEFAULT 'pending',
        "professional_title" VARCHAR(255),
        "institution" VARCHAR(255),
        "cv_url" TEXT,
        "id_card_url" TEXT,
        "notes" TEXT,
        "approved_by" VARCHAR(255),
        "expires_at" VARCHAR(255),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 22. Email Templates
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "email_templates" (
        "id" VARCHAR(255) PRIMARY KEY,
        "name_ar" VARCHAR(255) NOT NULL,
        "name_en" VARCHAR(255) NOT NULL,
        "subject_ar" VARCHAR(255) NOT NULL,
        "subject_en" VARCHAR(255) NOT NULL,
        "content_ar" TEXT NOT NULL,
        "content_en" TEXT NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 23. Journalist Safety Agent Tables
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "jpt_potential_incidents" (
        "id" VARCHAR(255) PRIMARY KEY,
        "victimName" VARCHAR(255),
        "victimInstitution" VARCHAR(255),
        "date" VARCHAR(255),
        "governorate" VARCHAR(255),
        "district" VARCHAR(255),
        "type" VARCHAR(255),
        "perpetrator" VARCHAR(255),
        "description" TEXT,
        "sourceUrl" VARCHAR(255),
        "sourcePlatform" VARCHAR(255),
        "originalText" TEXT,
        "confidenceScore" INTEGER,
        "confidenceLevel" VARCHAR(50),
        "status" VARCHAR(50) DEFAULT 'pending',
        "duplicateOf" VARCHAR(255),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "jpt_watchlists" (
        "id" VARCHAR(255) PRIMARY KEY,
        "type" VARCHAR(50),
        "name" VARCHAR(255),
        "notes" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "jpt_alerts" (
        "id" VARCHAR(255) PRIMARY KEY,
        "incidentId" VARCHAR(255),
        "victimName" VARCHAR(255),
        "type" VARCHAR(255),
        "severity" VARCHAR(50),
        "notifiedTeams" VARCHAR(255),
        "sentAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "jpt_crawl_logs" (
        "id" VARCHAR(255) PRIMARY KEY,
        "sourceUrl" VARCHAR(255),
        "extractedCount" INTEGER,
        "rawLog" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure slider columns on slider-capable tables
    const allSliderTables = ['articles', 'jobs', 'courses', 'projects', 'events', 'cinema_shows', 'videos', 'tenders'];
    for (const table of allSliderTables) {
      await pgPool.query(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "show_in_slider" INTEGER DEFAULT 0;`).catch(() => {});
      await pgPool.query(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "slider_caption" TEXT;`).catch(() => {});
      await pgPool.query(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "slider_button_text" TEXT;`).catch(() => {});
      await pgPool.query(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "slider_image" TEXT;`).catch(() => {});
    }

    console.log('PressHouse: PostgreSQL schemas and tables initialized successfully!');
  } catch (err: any) {
    console.error('PostgreSQL Schema Initialization Error:', err.message);
  }
}

// Auto-run schema initialization on module import
initPgSchema().catch(err => console.error('Failed to auto-init PG schema:', err));
