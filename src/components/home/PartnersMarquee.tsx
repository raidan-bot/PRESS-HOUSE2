import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { ShieldCheck, Award, Heart, Globe2 } from 'lucide-react';

export const PartnersMarquee: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const partners = [
    { name: isRtl ? 'الاتحاد الدولي للصحفيين (IFJ)' : 'International Federation of Journalists', logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&q=80&w=200' },
    { name: isRtl ? 'منظمة اليونسكو (UNESCO)' : 'UNESCO', logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=200' },
    { name: isRtl ? 'البعثة الأوروبية لدعم الإعلام' : 'European Media Support', logo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=200' },
    { name: isRtl ? 'مؤسسة الحماية الرقمية (Digital Defenders)' : 'Digital Defenders Partnership', logo: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=200' },
    { name: isRtl ? 'شبكة إعلاميون من أجل صحافة استقصائية' : 'ARIJ Fact-Checking Network', logo: 'https://images.unsplash.com/photo-1542744094-3a31727223ec?auto=format&fit=crop&q=80&w=200' },
    { name: isRtl ? 'المنظمة الدولية لدعم الإعلام (IMS)' : 'International Media Support', logo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=200' },
  ];

  return (
    <section className="bg-white border-y border-slate-100 py-12 md:py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
        <h3 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight">
          {isRtl ? 'نعمل بشراكة مع أبرز المنظمات والمؤسسات الدولية' : 'Working in Partnership with Leading Global Institutions'}
        </h3>
      </div>

      <div className="flex overflow-hidden space-x-12 rtl:space-x-reverse select-none">
        <motion.div
          animate={{ x: isRtl ? [0, 1000] : [0, -1000] }}
          transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
          className="flex shrink-0 items-center gap-12 md:gap-16"
        >
          {partners.concat(partners).map((p, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-50 border border-slate-100/80 hover:border-blue-200 transition-all group shrink-0"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-md">
                <ShieldCheck size={18} />
              </div>
              <span className="text-xs md:text-sm font-extrabold text-slate-700 group-hover:text-blue-600 transition-colors whitespace-nowrap">
                {p.name}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PartnersMarquee;
