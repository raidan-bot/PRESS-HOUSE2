import pool from '../db';

export class SystemRepository {
  static async getMenus(location?: string) {
    try {
      let query = 'SELECT * FROM menus';
      const values = [];
      if (location) {
        query += ' WHERE location = ?';
        values.push(location);
      }
      query += ' ORDER BY "order" ASC';
      const [rows] = await pool.query(query, values);
      return rows;
    } catch (error) {
      console.error('getMenus error:', error);
      return [];
    }
  }

  static async getPageContent(pageName: string) {
    try {
      const [rows] = await pool.query('SELECT * FROM page_content WHERE page_name = ?', [pageName]);
      return rows;
    } catch (error) {
      console.error('getPageContent error:', error);
      return [];
    }
  }

  static async getComprehensiveStats() {
    try {
      const [artCount]: any = await pool.query("SELECT COUNT(*) as count FROM articles WHERE status='published'");
      const [prjCount]: any = await pool.query('SELECT COUNT(*) as count FROM projects');
      const [userCount]: any = await pool.query('SELECT COUNT(*) as count FROM users');
      const [vialCount]: any = await pool.query('SELECT COUNT(*) as count FROM violations');

      return {
        success: true,
        stats: {
          totalArticles: artCount[0].count,
          totalProjects: prjCount[0].count,
          totalUsers: userCount[0].count,
          totalViolations: vialCount[0].count,
          totalBeneficiaries: 1250,
          totalCourses: 45,
          totalReports: 89,
          totalVolunteers: 12
        }
      };
    } catch (err) {
      return { success: false, stats: {} };
    }
  }

  static async getLiveIndicators() {
    return {
      success: true,
      indicators: [
        { id: 1, label: { ar: 'مؤشر حرية الصحافة', en: 'Press Freedom' }, value: 34, trend: 'up' },
        { id: 2, label: { ar: 'الانتهاكات المرصودة', en: 'Monitored Violations' }, value: 12, trend: 'down' }
      ]
    };
  }

  static async getInstitutionIdentity() {
    try {
      const [rows]: any = await pool.query('SELECT * FROM institution_identity WHERE id = 1 LIMIT 1');
      return rows && rows.length > 0 ? rows[0] : {};
    } catch (error) {
      console.error('getInstitutionIdentity error:', error);
      return {};
    }
  }

  static async getHeroSlides() {
    try {
      const [rows] = await pool.query('SELECT * FROM hero_slides ORDER BY `order` ASC');
      return rows;
    } catch (error) {
      console.error('getHeroSlides error:', error);
      return [];
    }
  }

  static async getDynamicHeroSlides() {
    try {
      const queries = [
        { table: 'articles', type: 'article', imgCol: 'mainImage' },
        { table: 'projects', type: 'project', imgCol: 'image' },
        { table: 'courses', type: 'course', imgCol: 'image' },
        { table: 'events', type: 'event', imgCol: 'image' },
        { table: 'cinema_shows', type: 'movie', imgCol: 'posterUrl' }
      ];

      let allSlides: any[] = [];
      const seenIds = new Set<string>();

      for (const q of queries) {
        try {
          // First try to get items marked show_in_slider
          const [sliderRows]: any = await pool.query(
            `SELECT * FROM ${q.table} WHERE show_in_slider = 1 OR show_in_slider = TRUE ORDER BY id DESC LIMIT 3`
          );
          
          if (Array.isArray(sliderRows) && sliderRows.length > 0) {
            for (const r of sliderRows) {
              const slideKey = `${q.type}-${r.id}`;
              if (!seenIds.has(slideKey)) {
                seenIds.add(slideKey);
                allSlides.push({
                  ...r,
                  type: q.type,
                  slider_image: r.slider_image || r[q.imgCol] || r.mainImage || r.image || r.imageUrl || r.posterUrl
                });
              }
            }
          } else {
            // Fallback: automatically pick the latest 1 item from this category
            const [latestRows]: any = await pool.query(
              `SELECT * FROM ${q.table} ORDER BY id DESC LIMIT 1`
            );
            if (Array.isArray(latestRows) && latestRows.length > 0) {
              for (const r of latestRows) {
                const slideKey = `${q.type}-${r.id}`;
                if (!seenIds.has(slideKey)) {
                  seenIds.add(slideKey);
                  allSlides.push({
                    ...r,
                    type: q.type,
                    slider_image: r.slider_image || r[q.imgCol] || r.mainImage || r.image || r.imageUrl || r.posterUrl
                  });
                }
              }
            }
          }
        } catch (e) {
          // Table or column might differ, safely catch
        }
      }
      return allSlides;
    } catch (error) {
      console.error('getDynamicHeroSlides error:', error);
      return [];
    }
  }
}
