import { Router, Request, Response } from 'express';
import { ArticleRepository } from '../repositories/article.repository';
import { ProjectRepository } from '../repositories/project.repository';
import { EventRepository } from '../repositories/event.repository';
import { JobRepository } from '../repositories/job.repository';
import { MediaRepository } from '../repositories/media.repository';

const router = Router();

router.get('/sitemap.xml', async (req: Request, res: Response) => {
  try {
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;

    // Static pages
    const staticRoutes = [
      '',
      '/about',
      '/news',
      '/events',
      '/projects',
      '/jobs',
      '/tenders',
      '/contact',
      '/terms',
      '/privacy',
      '/policy',
      '/membership',
      '/legal',
      '/academy',
      '/violations',
      '/videos',
      '/cinema',
    ];

    // Crawl dynamic routes from database repositories
    const [articles, projects, events, jobs, media] = await Promise.all([
      ArticleRepository.findAll().catch(() => []),
      ProjectRepository.findAll().catch(() => []),
      EventRepository.findAll().catch(() => []),
      JobRepository.findAll().catch(() => []),
      MediaRepository.findAll().catch(() => []),
    ]);

    const dynamicRoutes: { loc: string; lastmod?: string; changefreq?: string; priority?: string }[] = [];

    // Articles
    if (Array.isArray(articles)) {
      articles.forEach((art: any) => {
        if (art.id) {
          dynamicRoutes.push({
            loc: `/news/${art.id}`,
            lastmod: art.updatedAt || art.createdAt ? new Date(art.updatedAt || art.createdAt).toISOString() : undefined,
            changefreq: 'daily',
            priority: '0.8',
          });
        }
      });
    }

    // Projects
    if (Array.isArray(projects)) {
      projects.forEach((proj: any) => {
        if (proj.id) {
          dynamicRoutes.push({
            loc: `/projects/${proj.id}`,
            lastmod: proj.updatedAt || proj.createdAt ? new Date(proj.updatedAt || proj.createdAt).toISOString() : undefined,
            changefreq: 'weekly',
            priority: '0.7',
          });
        }
      });
    }

    // Events
    if (Array.isArray(events)) {
      events.forEach((evt: any) => {
        if (evt.id) {
          dynamicRoutes.push({
            loc: `/events/${evt.id}`,
            lastmod: evt.updatedAt || evt.createdAt ? new Date(evt.updatedAt || evt.createdAt).toISOString() : undefined,
            changefreq: 'weekly',
            priority: '0.7',
          });
        }
      });
    }

    // Jobs
    if (Array.isArray(jobs)) {
      jobs.forEach((job: any) => {
        if (job.id) {
          dynamicRoutes.push({
            loc: `/jobs/${job.id}`,
            lastmod: job.updatedAt || job.createdAt ? new Date(job.updatedAt || job.createdAt).toISOString() : undefined,
            changefreq: 'weekly',
            priority: '0.6',
          });
        }
      });
    }

    // Media Products
    if (Array.isArray(media)) {
      media.forEach((item: any) => {
        if (item.slug && item.category) {
          dynamicRoutes.push({
            loc: `/${item.category}/${item.slug}`,
            lastmod: item.updatedAt || item.createdAt ? new Date(item.updatedAt || item.createdAt).toISOString() : undefined,
            changefreq: 'monthly',
            priority: '0.5',
          });
        }
      });
    }

    const xmlUrls = [
      ...staticRoutes.map((route) => `
  <url>
    <loc>${baseUrl}${route}</loc>
    <changefreq>daily</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`),
      ...dynamicRoutes.map((item) => `
  <url>
    <loc>${baseUrl}${item.loc}</loc>
    ${item.lastmod ? `<lastmod>${item.lastmod}</lastmod>` : ''}
    <changefreq>${item.changefreq || 'weekly'}</changefreq>
    <priority>${item.priority || '0.5'}</priority>
  </url>`),
    ];

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls.join('')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemapXml);
  } catch (error) {
    console.error('Sitemap Generation Error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

export default router;
