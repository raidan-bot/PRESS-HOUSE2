import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Film, Play, Calendar, Clock, Ticket, ArrowRight, Sparkles, Star, Clapperboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

interface CinemaShowItem {
  id: string;
  title: any;
  director?: string;
  genre?: string;
  show_date?: string;
  show_time?: string;
  poster_url?: string;
  trailer_url?: string;
  synopsis?: any;
  plot?: any;
  duration?: string;
}

export const LatestCinemaSection: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [shows, setShows] = useState<CinemaShowItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCinema = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/cinema/shows');
        const data = Array.isArray(response.data) ? response.data : [];
        if (data.length > 0) {
          setShows(data.slice(0, 3));
        } else {
          setShows(fallbackCinema);
        }
      } catch (err) {
        setShows(fallbackCinema);
      } finally {
        setLoading(false);
      }
    };

    fetchCinema();
  }, [isRtl]);

  const fallbackCinema: CinemaShowItem[] = [
    {
      id: 'cinema-1',
      title: { ar: 'الفلم الوثائقي: أصوات من الرمال', en: 'Documentary: Voices from the Sand' },
      director: 'عمر العدني',
      genre: isRtl ? 'وثائقي / إنساني' : 'Documentary / Human Rights',
      show_date: '2026-08-12',
      show_time: '06:00 PM',
      duration: '78 min',
      poster_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=800',
      synopsis: {
        ar: 'عرض وثائقي يسلط الضوء على شهادات حية لمراسلين وثقوا تحولات الحياة الاجتماعية والإنسانية في اليمن خلال العقد الأخير.',
        en: 'A poignant documentary highlighting eyewitness testimony of journalists documenting social changes in Yemen.'
      }
    },
    {
      id: 'cinema-2',
      title: { ar: 'فلم: عدسة تحت الحصار', en: 'Film: Lens Under Siege' },
      director: 'سارة يحيى',
      genre: isRtl ? 'سينما مستقلة' : 'Indie Cinema',
      show_date: '2026-08-19',
      show_time: '06:00 PM',
      duration: '92 min',
      poster_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=800',
      synopsis: {
        ar: 'قصة درامية مستوحاة من واقع مصورة صحفية تتحدى الظروف الصعبة لإكمال تحقيق استقصائي حول التراث المعماري.',
        en: 'A dramatic story inspired by a photojournalist navigating extreme conditions to document architectural heritage.'
      }
    },
    {
      id: 'cinema-3',
      title: { ar: 'أرشيف الذاكرة الإعلامية', en: 'Media Memory Archive' },
      director: 'مركز بيت الصحافة',
      genre: isRtl ? 'أرشيفي / تاريخي' : 'Archival / Historical',
      show_date: '2026-08-26',
      show_time: '06:00 PM',
      duration: '60 min',
      poster_url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=800',
      synopsis: {
        ar: 'استعراض تاريخي لأوائل الصحف والراديو في اليمن ونشأة الحركات الصحفية الأولى.',
        en: 'Historical overview of early newspapers and radio broadcasting in Yemen.'
      }
    }
  ];

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

  return (
    <section className="relative py-20 bg-slate-950 text-white overflow-hidden rounded-[48px] my-12 border border-slate-800">
      {/* Background Accent Gradients */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 space-y-12">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-800/80 pb-8">
          <div className="space-y-3">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight flex items-center gap-3">
              <span>{isRtl ? 'سينما الأربعاء - أحدث العروض' : 'Wednesday Cinema - Latest Screenings'}</span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-2xl">
              {isRtl
                ? 'مبادرة ثنائية أسبوعية تعرض أفلاماً وثائقية ومستقلة تفتح آفاق النقاش الثقافي والإنساني في قاعة المنظمة.'
                : 'A weekly initiative screening independent and documentary films fostering open cultural dialogue.'}
            </p>
          </div>

          <Link
            to="/cinema"
            className="group flex items-center gap-2.5 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40 active:scale-95 shrink-0"
          >
            <Ticket size={16} />
            <span>{isRtl ? 'حجز تذاكر السينما' : 'Book Cinema Tickets'}</span>
            <ArrowRight size={16} className={`transition-transform group-hover:translate-x-1 ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
          </Link>
        </div>

        {/* Shows Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {shows.map((show, idx) => {
            const title = parseField(show.title);
            const synopsis = parseField(show.synopsis || show.plot);

            return (
              <motion.div
                key={show.id || idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group flex flex-col bg-slate-900/80 rounded-[32px] border border-slate-800/80 hover:border-blue-500/50 shadow-xl hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-500 overflow-hidden"
              >
                {/* Film Poster Box */}
                <div className="relative aspect-[3/4] overflow-hidden bg-slate-950">
                  <img
                    src={show.poster_url || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=800'}
                    alt={isRtl ? title?.ar : title?.en}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85 group-hover:opacity-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Play Hover Overlay - Royal Blue */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/40 backdrop-blur-xs">
                    <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                      <Play size={24} className={isRtl ? 'mr-1' : 'ml-1'} />
                    </div>
                  </div>

                  {/* Genre Tag */}
                  {show.genre && (
                    <div className="absolute top-4 right-4 rtl:right-4 rtl:left-auto bg-slate-950/80 backdrop-blur-md border border-slate-700 text-blue-400 text-[10px] font-mono font-bold px-3 py-1 rounded-full">
                      {show.genre}
                    </div>
                  )}

                  {/* Duration Tag */}
                  {show.duration && (
                    <div className="absolute bottom-4 left-4 rtl:left-4 rtl:right-auto bg-blue-600 text-white text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md">
                      {show.duration}
                    </div>
                  )}
                </div>

                {/* Show Details */}
                <div className="p-6 md:p-8 flex flex-col flex-grow space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400 border-b border-slate-800 pb-3">
                    <Calendar size={14} className="text-blue-400" />
                    <span>{show.show_date || (show.show_time ? String(show.show_time).split(' ')[0] : 'الأربعاء القادم')}</span>
                    <span>•</span>
                    <Clock size={14} className="text-blue-400" />
                    <span>{show.show_time || '06:00 PM'}</span>
                  </div>

                  <h3 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                    {isRtl ? title?.ar || title?.en : title?.en || title?.ar}
                  </h3>

                  {show.director && (
                    <p className="text-xs text-slate-400 font-medium">
                      {isRtl ? `إخراج: ${show.director}` : `Directed by: ${show.director}`}
                    </p>
                  )}

                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                    {isRtl ? synopsis?.ar || synopsis?.en : synopsis?.en || synopsis?.ar}
                  </p>

                  <div className="mt-auto pt-4">
                    <Link
                      to={`/cinema/${show.id}`}
                      className="w-full text-center px-4 py-3 rounded-2xl bg-blue-600/20 hover:bg-blue-600 text-white font-black text-xs transition-all flex items-center justify-center gap-2 group/btn shadow-md border border-blue-500/30"
                    >
                      <Ticket size={14} />
                      <span>{isRtl ? 'حجز التذكرة المجانية' : 'Reserve Free Ticket'}</span>
                      <ArrowRight size={14} className={`transition-transform group-hover/btn:translate-x-1 ${isRtl ? 'rotate-180 group-hover/btn:-translate-x-1' : ''}`} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LatestCinemaSection;

