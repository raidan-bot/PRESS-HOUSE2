import { Document } from 'flexsearch';
import { api } from './api';

export interface SearchIndexItem {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  type: 'news' | 'report' | 'job' | 'event' | 'project' | 'tender';
  url: string;
  date?: string;
}

class SearchIndexService {
  private index: Document<SearchIndexItem, true>;
  private itemsMap: Map<string, SearchIndexItem> = new Map();
  private isInitialized: boolean = false;
  private isIndexing: boolean = false;

  constructor() {
    this.index = new Document<SearchIndexItem, true>({
      document: {
        id: 'id',
        index: ['title', 'description', 'content', 'category'],
        store: ['id', 'title', 'description', 'category', 'type', 'url', 'date'],
      },
      tokenize: 'full',
      cache: true,
    });
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized || this.isIndexing) return;
    this.isIndexing = true;

    try {
      const [articlesRes, jobsRes, projectsRes, eventsRes] = await Promise.allSettled([
        api.get('/api/articles'),
        api.get('/api/jobs'),
        api.get('/api/projects'),
        api.get('/api/events'),
      ]);

      const parseField = (val: any) => {
        if (!val) return '';
        if (typeof val === 'object') return val.ar || val.en || '';
        if (typeof val === 'string') {
          try {
            const parsed = JSON.parse(val);
            return parsed.ar || parsed.en || val;
          } catch {
            return val;
          }
        }
        return String(val);
      };

      // Index Articles
      if (articlesRes.status === 'fulfilled' && Array.isArray(articlesRes.value.data)) {
        articlesRes.value.data.forEach((art: any) => {
          if (!art.id) return;
          const isReport = art.category === 'reports' || art.category === 'report';
          const item: SearchIndexItem = {
            id: `article_${art.id}`,
            title: parseField(art.title),
            description: parseField(art.summary || art.content).slice(0, 150),
            content: parseField(art.content),
            category: art.category || (isReport ? 'reports' : 'news'),
            type: isReport ? 'report' : 'news',
            url: `/news/${art.id}`,
            date: art.createdAt ? new Date(art.createdAt).toLocaleDateString('ar-YE') : undefined,
          };
          this.addItem(item);
        });
      }

      // Index Jobs
      if (jobsRes.status === 'fulfilled' && Array.isArray(jobsRes.value.data)) {
        jobsRes.value.data.forEach((job: any) => {
          if (!job.id) return;
          const item: SearchIndexItem = {
            id: `job_${job.id}`,
            title: parseField(job.title),
            description: parseField(job.description).slice(0, 150),
            content: parseField(job.description),
            category: 'jobs',
            type: 'job',
            url: `/jobs/${job.id}`,
            date: job.createdAt ? new Date(job.createdAt).toLocaleDateString('ar-YE') : undefined,
          };
          this.addItem(item);
        });
      }

      // Index Projects
      if (projectsRes.status === 'fulfilled' && Array.isArray(projectsRes.value.data)) {
        projectsRes.value.data.forEach((proj: any) => {
          if (!proj.id) return;
          const item: SearchIndexItem = {
            id: `project_${proj.id}`,
            title: parseField(proj.title),
            description: parseField(proj.shortDescription || proj.description).slice(0, 150),
            content: parseField(proj.content || proj.description),
            category: 'projects',
            type: 'project',
            url: `/projects/${proj.id}`,
            date: proj.createdAt ? new Date(proj.createdAt).toLocaleDateString('ar-YE') : undefined,
          };
          this.addItem(item);
        });
      }

      // Index Events
      if (eventsRes.status === 'fulfilled' && Array.isArray(eventsRes.value.data)) {
        eventsRes.value.data.forEach((evt: any) => {
          if (!evt.id) return;
          const item: SearchIndexItem = {
            id: `event_${evt.id}`,
            title: parseField(evt.title),
            description: parseField(evt.description).slice(0, 150),
            content: parseField(evt.description),
            category: 'events',
            type: 'event',
            url: `/events/${evt.id}`,
            date: evt.eventDate ? new Date(evt.eventDate).toLocaleDateString('ar-YE') : undefined,
          };
          this.addItem(item);
        });
      }

      this.isInitialized = true;
    } catch (err) {
      console.error('Failed to index content into FlexSearch:', err);
    } finally {
      this.isIndexing = false;
    }
  }

  private addItem(item: SearchIndexItem) {
    this.itemsMap.set(item.id, item);
    this.index.add(item);
  }

  public getAutocompleteSuggestions(query: string, limit: number = 5): SearchIndexItem[] {
    if (!query || query.trim().length < 2) return [];
    const normalized = query.trim().toLowerCase();
    
    const matched: SearchIndexItem[] = [];
    for (const item of this.itemsMap.values()) {
      if (
        item.title.toLowerCase().includes(normalized) ||
        item.description.toLowerCase().includes(normalized) ||
        item.category.toLowerCase().includes(normalized)
      ) {
        matched.push(item);
        if (matched.length >= limit) break;
      }
    }
    return matched;
  }

  public search(query: string, filterType: string = 'all'): SearchIndexItem[] {
    if (!query || query.trim() === '') {
      const allItems = Array.from(this.itemsMap.values());
      return filterType === 'all' ? allItems : allItems.filter(i => i.type === filterType);
    }

    const normalized = query.trim().toLowerCase();
    const resultsMap = new Map<string, SearchIndexItem>();

    for (const item of this.itemsMap.values()) {
      const titleMatch = item.title.toLowerCase().includes(normalized);
      const descMatch = item.description.toLowerCase().includes(normalized);
      const contentMatch = item.content.toLowerCase().includes(normalized);

      if (titleMatch || descMatch || contentMatch) {
        if (filterType === 'all' || item.type === filterType) {
          resultsMap.set(item.id, item);
        }
      }
    }

    return Array.from(resultsMap.values());
  }

  public getIsInitialized(): boolean {
    return this.isInitialized;
  }
}

export const searchIndexService = new SearchIndexService();
