import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { ArrowRight, FolderKanban, CheckCircle2, Clock, Users, Globe2, Sparkles, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

interface ProjectItem {
  id: string;
  title: any;
  description: any;
  sector?: string;
  budget?: string;
  beneficiaries_count?: number;
  status?: string;
  image?: string;
  isFeatured?: boolean | number;
  startDate?: string;
  endDate?: string;
}

export const LatestProjectsSection: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/api/projects');
        const data = Array.isArray(response.data) ? response.data : [];
        
        if (data.length > 0) {
          setProjects(data.slice(0, 3));
        } else {
          setProjects(fallbackProjects);
        }
      } catch (err) {
        setProjects(fallbackProjects);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [isRtl]);

  const fallbackProjects: ProjectItem[] = [
    {
      id: 'proj-1',
      title: { ar: 'مشروع تعزيز الحريات الصحفية والسلامة الرقمية', en: 'Promoting Press Freedom & Digital Safety' },
      description: { 
        ar: 'مبادرة استراتيجية تشمل تدريب 120 صحفياً يمنياً على أساليب الحماية الأمنية الرقمية والتعامل مع المخاطر الميدانية.', 
        en: 'Strategic initiative training 120 Yemeni journalists on digital protection methods and field risk handling.' 
      },
      sector: isRtl ? 'الحماية والسلامة' : 'Protection & Safety',
      beneficiaries_count: 120,
      status: 'ongoing',
      image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'proj-2',
      title: { ar: 'برنامج الصحافة الاستقصائية ومكافحة التضليل', en: 'Investigative Journalism & Anti-Disinformation' },
      description: { 
        ar: 'دعم وتحفيز تحقيقات صحفية استقصائية تسلط الضوء على القضايا الإنسانية والتنمية والتأكد من صحة الأخبار.', 
        en: 'Supporting in-depth investigative reports focusing on humanitarian issues and fact-checking.' 
      },
      sector: isRtl ? 'التطوير المهني' : 'Professional Development',
      beneficiaries_count: 85,
      status: 'ongoing',
      image: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'proj-3',
      title: { ar: 'مشروع رصد الانتهاكات والتمكين القانوني', en: 'Violations Monitoring & Legal Empowerment' },
      description: { 
        ar: 'تأمين تغطية قانونية شاملة للصحفيين المستقلين ورصد دقيق للشبكات الإعلامية في المحافظات اليمنية.', 
        en: 'Comprehensive legal coverage for independent journalists and accurate network monitoring in Yemen.' 
      },
      sector: isRtl ? 'الرصد والحقوق' : 'Monitoring & Rights',
      beneficiaries_count: 250,
      status: 'completed',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800'
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div className="space-y-3">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            {isRtl ? 'أحدث المشاريع والبرامج' : 'Latest Projects & Programs'}
          </h2>
          <p className="text-slate-500 text-sm md:text-base max-w-2xl">
            {isRtl 
              ? 'نعمل من خلال مشاريعنا الميدانية على حماية الصحفيين، بناء القدرات المهنية، وتعزيز صحافة الحقيقة والمساءلة.' 
              : 'Our field projects aim to protect journalists, build professional capacity, and support accountability journalism.'}
          </p>
        </div>

        <Link 
          to="/projects" 
          className="group flex items-center gap-2.5 px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 shrink-0"
        >
          <span>{isRtl ? 'استعرض كافة المشاريع' : 'Explore All Projects'}</span>
          <ArrowRight size={16} className={`transition-transform group-hover:translate-x-1 ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
        </Link>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {projects.map((proj, idx) => {
          const parseField = (val: any) => {
            if (!val) return { ar: '', en: '' };
            if (typeof val === 'object') return val;
            if (typeof val === 'string') {
              if (val.trim().startsWith('{')) {
                try {
                  return JSON.parse(val);
                } catch {
                  return { ar: val, en: val };
                }
              }
              return { ar: val, en: val };
            }
            return { ar: String(val), en: String(val) };
          };

          const title = parseField(proj.title);
          const desc = parseField(proj.description);

          return (
            <motion.article
              key={proj.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group flex flex-col bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-500 overflow-hidden"
            >
              {/* Image & Status Badge */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                <img
                  src={proj.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800'}
                  alt={isRtl ? title?.ar : title?.en}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                {/* Sector Chip */}
                {proj.sector && (
                  <div className="absolute top-4 right-4 rtl:right-4 rtl:left-auto bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-black px-3.5 py-1.5 rounded-full shadow-md">
                    {proj.sector}
                  </div>
                )}

                {/* Status Indicator */}
                <div className="absolute bottom-4 left-4 rtl:left-4 rtl:right-auto flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white border border-white/10">
                  <span className={`w-2 h-2 rounded-full ${proj.status === 'completed' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                  {proj.status === 'completed' ? (isRtl ? 'مكتمل' : 'Completed') : (isRtl ? 'جارٍ التنفيذ' : 'In Progress')}
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 md:p-8 flex flex-col flex-grow space-y-4">
                <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                  {isRtl ? title?.ar || title?.en : title?.en || title?.ar}
                </h3>

                <p className="text-slate-500 text-xs md:text-sm leading-relaxed line-clamp-3">
                  {isRtl ? desc?.ar || desc?.en : desc?.en || desc?.ar}
                </p>

                {/* Meta details */}
                <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                  {proj.beneficiaries_count ? (
                    <span className="flex items-center gap-1.5 text-blue-600 font-mono">
                      <Users size={14} />
                      {proj.beneficiaries_count} {isRtl ? 'مستفيد' : 'Beneficiaries'}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Target size={14} />
                      {isRtl ? 'مشروع حقوقي' : 'Rights Program'}
                    </span>
                  )}

                  <Link
                    to={`/projects/${proj.id}`}
                    className="inline-flex items-center gap-1.5 text-slate-900 group-hover:text-blue-600 font-black uppercase text-[11px] tracking-wider transition-colors"
                  >
                    <span>{isRtl ? 'التفاصيل' : 'Details'}</span>
                    <ArrowRight size={14} className={isRtl ? 'rotate-180' : ''} />
                  </Link>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
};

export default LatestProjectsSection;
