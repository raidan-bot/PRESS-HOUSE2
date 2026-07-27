import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Calendar, Clock, MapPin, ArrowRight, Ticket, Users, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

interface EventItem {
  id: string;
  title: any;
  description: any;
  date?: string;
  eventDate?: string;
  time?: string;
  location?: string;
  type?: string;
  category?: string;
  image?: string;
  imageUrl?: string;
  mainImage?: string;
  isUpcoming?: boolean;
}

export const LatestEventsSection: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/events');
        const data = Array.isArray(response.data) ? response.data : [];
        if (data.length > 0) {
          setEvents(data.slice(0, 3));
        } else {
          setEvents(fallbackEvents);
        }
      } catch (err) {
        setEvents(fallbackEvents);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [isRtl]);

  const fallbackEvents: EventItem[] = [
    {
      id: 'evt-1',
      title: { ar: 'ندوة حوارية: صحافة السلام وحماية الصحفيين في النزاعات', en: 'Seminar: Peace Journalism & Journalist Protection in Conflict' },
      description: { 
        ar: 'جلسة نقاشية تجمع نخبة من الصحفيين والحقوقيين لمناقشة تحديات التغطية الميدانية وآليات حماية الطواقم الصحفية.', 
        en: 'A panel discussion bringing journalists and human rights experts to address field coverage challenges.' 
      },
      date: '2026-08-05',
      time: '10:00 AM',
      location: isRtl ? 'عدن / عبر زوم' : 'Aden / Via Zoom',
      type: isRtl ? 'ندوة حوارية' : 'Interactive Seminar',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'evt-2',
      title: { ar: 'ورشة عمل: تقنيات التحقق واستخدام الذكاء الاصطناعي في الإعلام', en: 'Workshop: Fact-Checking & AI in Media' },
      description: { 
        ar: 'تدريب عملي موجه للصحفيين والباحثين لكشف التزييف العميق وتوثيق الأدلة الرقمية.', 
        en: 'Hands-on practical training for journalists on deepfake detection and digital evidence verification.' 
      },
      date: '2026-08-18',
      time: '04:00 PM',
      location: isRtl ? 'تعز - قاعة بيت الصحافة' : 'Taiz - Press House Hall',
      type: isRtl ? 'ورشة عمل' : 'Practical Workshop',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'evt-3',
      title: { ar: 'المنتدى السنوي الأول لحرية الإعلام في اليمن', en: 'First Annual Forum for Media Freedom in Yemen' },
      description: { 
        ar: 'إطلاق التقرير السنوي الشامل واستعراض شهادات حية لمراسلين وصحفيين حول واقع الحريات.', 
        en: 'Launching the annual comprehensive report and presenting eyewitness accounts on press freedom.' 
      },
      date: '2026-09-01',
      time: '09:00 AM',
      location: isRtl ? 'صنعاء / بث مباشر' : "Sana'a / Live Stream",
      type: isRtl ? 'منتدى سنوي' : 'Annual Forum',
      image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=800'
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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div className="space-y-3">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            {isRtl ? 'أحدث الفعاليات والندوات' : 'Latest Events & Seminars'}
          </h2>
          <p className="text-slate-500 text-sm md:text-base max-w-2xl">
            {isRtl 
              ? 'ننظم ندوات دورية وورش عمل تفاعلية تجمع صناع القرار والاعلاميين لمناقشة أحدث قضايا الصحافة والحقوق.' 
              : 'We organize regular seminars and interactive workshops uniting decision makers and media professionals.'}
          </p>
        </div>

        <Link 
          to="/events" 
          className="group flex items-center gap-2.5 px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 shrink-0"
        >
          <span>{isRtl ? 'جدول الفعاليات الكامل' : 'Full Events Schedule'}</span>
          <ArrowRight size={16} className={`transition-transform group-hover:translate-x-1 ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
        </Link>
      </div>

      {/* Events List / Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {events.map((evt, idx) => {
          const title = parseField(evt.title);
          const desc = parseField(evt.description);
          const eventDate = evt.eventDate || evt.date || '2026-08-15';
          const eventImg = evt.image || evt.imageUrl || evt.mainImage || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800';
          const eventType = evt.type || evt.category || (isRtl ? 'فعالية حقوقية' : 'Rights Event');

          return (
            <motion.div
              key={evt.id || idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group flex flex-col bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 overflow-hidden"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-slate-900">
                <img
                  src={eventImg}
                  alt={isRtl ? title?.ar : title?.en}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                {/* Event Type Badge - Royal Blue */}
                {eventType && (
                  <div className="absolute top-4 right-4 rtl:right-4 rtl:left-auto bg-blue-600 text-white text-[10px] font-black px-3.5 py-1.5 rounded-full shadow-md">
                    {eventType}
                  </div>
                )}
              </div>

              <div className="p-6 md:p-8 flex flex-col flex-grow space-y-4">
                {/* Date and Location Pills - Royal Blue for dates */}
                <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500 border-b border-slate-100 pb-4">
                  <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-xl font-mono">
                    <Calendar size={14} className="text-blue-600" />
                    {eventDate}
                  </span>
                  {evt.location && (
                    <span className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
                      <MapPin size={14} />
                      {evt.location}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                  {isRtl ? title?.ar || title?.en : title?.en || title?.ar}
                </h3>

                <p className="text-slate-500 text-xs md:text-sm leading-relaxed line-clamp-3">
                  {isRtl ? desc?.ar || desc?.en : desc?.en || desc?.ar}
                </p>

                <div className="mt-auto pt-6 flex items-center justify-between">
                  <Link
                    to={`/events/${evt.id}`}
                    className="w-full text-center px-4 py-3 rounded-2xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-black text-xs transition-all flex items-center justify-center gap-2 group/btn shadow-xs"
                  >
                    <span>{isRtl ? 'حجز مقعد / التفاصيل' : 'Register / Details'}</span>
                    <ArrowRight size={14} className={`transition-transform group-hover/btn:translate-x-1 ${isRtl ? 'rotate-180 group-hover/btn:-translate-x-1' : ''}`} />
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default LatestEventsSection;

