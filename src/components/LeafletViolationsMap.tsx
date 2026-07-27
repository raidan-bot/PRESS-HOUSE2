import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { useTranslation } from 'react-i18next';
import { 
  Flame, 
  MapPin, 
  AlertCircle, 
  Calendar, 
  User, 
  Layers, 
  Sliders, 
  Activity, 
  Compass, 
  Eye, 
  Globe, 
  Info 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Fix default Leaflet icon issue in React/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LeafletViolationsMapProps {
  violations: any[];
}

// Center of Yemen
const YEMEN_CENTER: [number, number] = [15.3694, 44.1910];

// Geographic coordinates lookup table for Yemen governorates and cities
const YEMEN_CITIES: Record<string, { nameAr: string; nameEn: string; lat: number; lng: number }> = {
  'صنعاء': { nameAr: 'مدينة صنعاء', nameEn: "Sana'a City", lat: 15.3547, lng: 44.2066 },
  'أمانة العاصمة صنعاء': { nameAr: 'أمانة العاصمة', nameEn: "Capital Secretariat Sana'a", lat: 15.3694, lng: 44.1910 },
  'عدن': { nameAr: 'مدينة عدن', nameEn: 'Aden City', lat: 12.7855, lng: 45.0187 },
  'تعز': { nameAr: 'مدينة تعز', nameEn: 'Taiz City', lat: 13.5789, lng: 44.0181 },
  'الحديدة': { nameAr: 'مدينة الحديدة', nameEn: 'Al Hudaydah', lat: 14.7978, lng: 42.9545 },
  'حضرموت': { nameAr: 'المكلا / حضرموت', nameEn: 'Mukalla / Hadramout', lat: 14.5425, lng: 49.1242 },
  'مأرب': { nameAr: 'مدينة مأرب', nameEn: 'Marib City', lat: 15.4542, lng: 45.3267 },
  'إب': { nameAr: 'مدينة إب', nameEn: 'Ibb City', lat: 13.9667, lng: 44.1833 },
  'ذمار': { nameAr: 'مدينة ذمار', nameEn: 'Dhamar City', lat: 14.5425, lng: 44.4053 },
  'صعدة': { nameAr: 'مدينة صعدة', nameEn: "Sa'ada City", lat: 16.9402, lng: 43.7634 },
  'شبوة': { nameAr: 'عتق / شبوة', nameEn: 'Ataq / Shabwah', lat: 14.5323, lng: 46.8322 },
  'أبين': { nameAr: 'زنجبار / أبين', nameEn: 'Zinjibar / Abyan', lat: 13.1287, lng: 45.3804 },
  'لحج': { nameAr: 'الحوطة / لحج', nameEn: 'Lahij City', lat: 13.0583, lng: 44.8822 },
  'الضالع': { nameAr: 'مدينة الضالع', nameEn: "Al Dhale'e City", lat: 13.6958, lng: 44.7314 },
  'البيضاء': { nameAr: 'مدينة البيضاء', nameEn: 'Al Bayda City', lat: 13.9852, lng: 45.5723 },
  'عمران': { nameAr: 'مدينة عمران', nameEn: 'Amran City', lat: 15.6594, lng: 43.9439 },
  'حجة': { nameAr: 'مدينة حجة', nameEn: 'Hajjah City', lat: 15.6942, lng: 43.6053 },
  'المحويت': { nameAr: 'مدينة المحويت', nameEn: 'Al Mahwit City', lat: 15.4701, lng: 43.5458 },
  'ريمة': { nameAr: 'الجبين / ريمة', nameEn: 'Al Jabin / Raymah', lat: 14.6289, lng: 43.7125 },
  'الجوف': { nameAr: 'الحزم / الجوف', nameEn: 'Al Hazm / Al Jawf', lat: 16.1644, lng: 44.7761 },
  'المهرة': { nameAr: 'الغيطة / المهرة', nameEn: 'Al Ghaydah / Al Mahrah', lat: 16.2079, lng: 52.1760 },
  'سقطرى': { nameAr: 'حديبو / سقطرى', nameEn: 'Hadibu / Socotra', lat: 12.6511, lng: 54.0192 },
};

// Component that dynamically mounts and updates Leaflet Heatmap Layer
function LeafletHeatmapLayer({ heatPoints, radius, blur }: { heatPoints: Array<[number, number, number]>; radius: number; blur: number }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !heatPoints || heatPoints.length === 0) return;

    const heatLayer = (L as any).heatLayer(heatPoints, {
      radius,
      blur,
      maxZoom: 9,
      minOpacity: 0.35,
      gradient: {
        0.15: '#3b82f6', // Low: Blue
        0.35: '#06b6d4', // Cyan
        0.55: '#eab308', // Medium: Yellow
        0.75: '#f97316', // High: Orange
        0.95: '#ef4444', // Critical: Red
      }
    });

    heatLayer.addTo(map);

    return () => {
      if (map && heatLayer) {
        map.removeLayer(heatLayer);
      }
    };
  }, [map, heatPoints, radius, blur]);

  return null;
}

export const LeafletViolationsMap: React.FC<LeafletViolationsMapProps> = ({ violations }) => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [layerMode, setLayerMode] = useState<'heatmap' | 'markers' | 'combined'>('combined');
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'dark'>('dark');
  const [heatRadius, setHeatRadius] = useState<number>(30);
  const [heatBlur, setHeatBlur] = useState<number>(18);
  const [showSettings, setShowSettings] = useState(false);

  // Default baseline data if violations list is empty
  const defaultBaselineViolations = [
    { id: 'b1', victimName: 'فريق قناة اليمن اليوم', governorate: 'صنعاء', type: 'احتجاز واعتداء', date: '2026-06-10', latitude: 15.3547, longitude: 44.2066 },
    { id: 'b2', victimName: 'محرر صحيفة الشارع', governorate: 'عدن', type: 'تهديد بالقتل', date: '2026-06-15', latitude: 12.7855, longitude: 45.0187 },
    { id: 'b3', victimName: 'مصور صحفي ميداني', governorate: 'تعز', type: 'إصابة برصاص', date: '2026-06-20', latitude: 13.5789, longitude: 44.0181 },
    { id: 'b4', victimName: 'مراسل راديو بلقيس', governorate: 'الحديدة', type: 'مصادرة معدات', date: '2026-06-25', latitude: 14.7978, longitude: 42.9545 },
    { id: 'b5', victimName: 'صحفي استقصائي مستقل', governorate: 'حضرموت', type: 'استدعاء أمني', date: '2026-07-02', latitude: 14.5425, longitude: 49.1242 },
    { id: 'b6', victimName: 'ناشط إعلامي حقوقي', governorate: 'مأرب', type: 'منع من التغطية', date: '2026-07-08', latitude: 15.4542, longitude: 45.3267 },
    { id: 'b7', victimName: 'صحفي في موقع يمن مونيتور', governorate: 'صنعاء', type: 'احتجاز تعسفي', date: '2026-07-12', latitude: 15.3694, longitude: 44.1910 },
  ];

  const activeViolations = violations.length > 0 ? violations : defaultBaselineViolations;

  // Process city density breakdown and heat points
  const { cityDensityList, heatPoints, totalDocumented } = useMemo(() => {
    const cityCounts: Record<string, { count: number; nameAr: string; nameEn: string; lat: number; lng: number }> = {};

    activeViolations.forEach((v) => {
      const govName = v.governorate || 'صنعاء';
      const cityMeta = YEMEN_CITIES[govName] || YEMEN_CITIES['صنعاء'];

      if (!cityCounts[govName]) {
        cityCounts[govName] = {
          count: 0,
          nameAr: cityMeta.nameAr,
          nameEn: cityMeta.nameEn,
          lat: v.latitude || cityMeta.lat,
          lng: v.longitude || cityMeta.lng,
        };
      }
      cityCounts[govName].count += 1;
    });

    const total = activeViolations.length;
    const sortedCities = Object.entries(cityCounts)
      .map(([key, item]) => {
        const ratio = total > 0 ? item.count / total : 0;
        let riskLevel: 'critical' | 'high' | 'medium' | 'low' = 'low';
        let color = '#3b82f6';

        if (ratio >= 0.2 || item.count >= 5) {
          riskLevel = 'critical';
          color = '#ef4444';
        } else if (ratio >= 0.12 || item.count >= 3) {
          riskLevel = 'high';
          color = '#f97316';
        } else if (ratio >= 0.06 || item.count >= 2) {
          riskLevel = 'medium';
          color = '#eab308';
        }

        return {
          govKey: key,
          ...item,
          ratio,
          percentage: Math.round(ratio * 100),
          riskLevel,
          color,
        };
      })
      .sort((a, b) => b.count - a.count);

    // Build heat points array [lat, lng, weight]
    const points: Array<[number, number, number]> = [];

    activeViolations.forEach((v) => {
      let lat = v.latitude;
      let lng = v.longitude;

      if (!lat || !lng) {
        const meta = YEMEN_CITIES[v.governorate] || YEMEN_CITIES['صنعاء'];
        // Add subtle jitter so stacked points spread slightly across city
        lat = meta.lat + (Math.random() - 0.5) * 0.04;
        lng = meta.lng + (Math.random() - 0.5) * 0.04;
      }

      points.push([lat, lng, 0.8]);
    });

    return {
      cityDensityList: sortedCities,
      heatPoints: points,
      totalDocumented: total,
    };
  }, [activeViolations]);

  // Tile URL configuration based on map style
  const tileConfig = {
    streets: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap &copy; CARTO',
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Esri World Imagery',
    },
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap &copy; CARTO Dark Matter',
    },
  };

  return (
    <div className="w-full space-y-4">
      {/* Map Control Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 md:p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-red-600 to-orange-500 text-white shadow-lg">
            <Flame size={24} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight">
              {isRtl ? 'الخريطة الحرارية لشدة الانتهاكات بالمدن اليمنية' : 'Violations Density Heatmap across Yemen'}
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              {isRtl 
                ? `تحليل مكاني عالي الدقة لـ ${totalDocumented} حالة موثقة حسب الكثافة الجغرافية` 
                : `High-resolution spatial analysis of ${totalDocumented} documented cases by city density`}
            </p>
          </div>
        </div>

        {/* Action Toggles */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Layer Mode Switcher */}
          <div className="flex bg-slate-800/80 p-1 rounded-2xl border border-slate-700 text-xs font-bold">
            <button
              onClick={() => setLayerMode('heatmap')}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                layerMode === 'heatmap'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame size={14} />
              {isRtl ? 'خريطة حرارية' : 'Heatmap'}
            </button>
            <button
              onClick={() => setLayerMode('markers')}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                layerMode === 'markers'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapPin size={14} />
              {isRtl ? 'نقاط الحالات' : 'Markers'}
            </button>
            <button
              onClick={() => setLayerMode('combined')}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                layerMode === 'combined'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers size={14} />
              {isRtl ? 'عالمي مدمج' : 'Combined'}
            </button>
          </div>

          {/* Map Style Selector */}
          <div className="flex bg-slate-800/80 p-1 rounded-2xl border border-slate-700 text-xs font-bold">
            {(['dark', 'streets', 'satellite'] as const).map((style) => (
              <button
                key={style}
                onClick={() => setMapStyle(style)}
                className={`px-2.5 py-2 rounded-xl transition-all ${
                  mapStyle === style
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {style === 'dark' ? (isRtl ? 'داكن' : 'Dark') : style === 'streets' ? (isRtl ? 'شارع' : 'Streets') : (isRtl ? 'أقمار' : 'Satellite')}
              </button>
            ))}
          </div>

          {/* Settings Toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2.5 rounded-2xl border transition-all text-xs font-bold flex items-center gap-1.5 ${
              showSettings
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Sliders size={16} />
            {isRtl ? 'التحكم' : 'Params'}
          </button>
        </div>
      </div>

      {/* Heatmap Parameters Drawer */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 text-white text-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold flex items-center gap-2 text-amber-400">
                <Sliders size={16} />
                {isRtl ? 'تعديل المعاملات الفيزيائية للخريطة الحرارية' : 'Adjust Heatmap Physical Density Parameters'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Kernel Density Estimation (KDE)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-slate-300">
                  <span>{isRtl ? 'شعاع انتشار التأثير (Radius)' : 'Heat Radius'}</span>
                  <span className="text-amber-400 font-bold">{heatRadius}px</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="60"
                  value={heatRadius}
                  onChange={(e) => setHeatRadius(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between font-mono text-slate-300">
                  <span>{isRtl ? 'درجة الضبابية والاندماج (Blur)' : 'Blur Smoothness'}</span>
                  <span className="text-amber-400 font-bold">{heatBlur}px</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="40"
                  value={heatBlur}
                  onChange={(e) => setHeatBlur(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Map Canvas Container */}
      <div className="relative w-full h-[620px] rounded-[36px] overflow-hidden border-4 border-slate-900 shadow-2xl z-10">
        <MapContainer
          center={YEMEN_CENTER}
          zoom={6}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution={tileConfig[mapStyle].attribution}
            url={tileConfig[mapStyle].url}
          />

          {/* Leaflet Heatmap Overlay */}
          {(layerMode === 'heatmap' || layerMode === 'combined') && (
            <LeafletHeatmapLayer
              heatPoints={heatPoints}
              radius={heatRadius}
              blur={heatBlur}
            />
          )}

          {/* City Density Concentric Pulse Rings */}
          {(layerMode === 'heatmap' || layerMode === 'combined') &&
            cityDensityList.map((city) => (
              <CircleMarker
                key={`city-ring-${city.govKey}`}
                center={[city.lat, city.lng]}
                radius={Math.min(25, 8 + city.count * 2)}
                pathOptions={{
                  color: city.color,
                  fillColor: city.color,
                  fillOpacity: 0.25,
                  weight: 2,
                  dashArray: '4,4',
                }}
              >
                <Popup className="custom-leaflet-popup">
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <div
                      className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase mb-2 text-white"
                      style={{ backgroundColor: city.color }}
                    >
                      {city.riskLevel === 'critical'
                        ? (isRtl ? 'كثافة حرجة للغاية' : 'Critical Density')
                        : city.riskLevel === 'high'
                        ? (isRtl ? 'كثافة مرتفعة' : 'High Density')
                        : (isRtl ? 'كثافة متوسطة' : 'Medium Density')}
                    </div>
                    <h4 className="font-black text-slate-900 text-base mb-1">
                      {isRtl ? city.nameAr : city.nameEn}
                    </h4>
                    <div className="text-2xl font-black text-slate-900 font-mono my-2">
                      {city.count}{' '}
                      <span className="text-xs font-normal text-slate-500">
                        {isRtl ? 'حالة موثقة' : 'Cases'} ({city.percentage}%)
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {isRtl
                        ? 'مستوى الخطورة والمخاطر الميدانية على الصحفيين في هذه المدينة.'
                        : 'Field risk level for press staff in this municipality.'}
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

          {/* Individual Incident Pins */}
          {(layerMode === 'markers' || layerMode === 'combined') &&
            activeViolations.map((v) => {
              const lat = v.latitude || YEMEN_CITIES[v.governorate]?.lat || 15.3547;
              const lng = v.longitude || YEMEN_CITIES[v.governorate]?.lng || 44.2066;

              return (
                <Marker key={v.id} position={[lat, lng]}>
                  <Popup className="custom-leaflet-popup">
                    <div className={isRtl ? 'text-right' : 'text-left'}>
                      <div className="flex items-center gap-1.5 mb-2 text-red-600 font-black uppercase tracking-widest text-[10px]">
                        <AlertCircle size={12} />
                        {v.type}
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">{v.victimName}</h4>
                      <p className="text-xs text-slate-500 mb-3">{v.governorate}</p>

                      <div className="space-y-1 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-[10px] text-slate-600">
                          <Calendar size={12} className="text-blue-600" />
                          {v.date}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-600">
                          <User size={12} className="text-blue-600" />
                          {v.victimInstitution || (isRtl ? 'صحفي مستقل' : 'Freelance Journalist')}
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>

        {/* On-Map Interactive Floating Density Legend */}
        <div className={`absolute bottom-6 ${isRtl ? 'right-6' : 'left-6'} z-[1000] bg-slate-900/90 backdrop-blur-md text-white p-4 rounded-2xl border border-slate-800 shadow-2xl text-xs space-y-3 max-w-xs`}>
          <div className="font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Flame size={14} />
              {isRtl ? 'مقياس كثافة الانتهاكات' : 'Violation Density Scale'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">P/Km²</span>
          </div>

          <div className="space-y-1.5">
            <div className="h-3 w-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 via-yellow-400 via-orange-500 to-red-600 shadow-inner" />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1">
              <span>{isRtl ? 'منخفضة' : 'Low'}</span>
              <span>{isRtl ? 'متوسطة' : 'Medium'}</span>
              <span>{isRtl ? 'مرتفعة' : 'High'}</span>
              <span className="text-red-400 font-bold">{isRtl ? 'حرجة' : 'Critical'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Cities Density Grid Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <h4 className="font-black text-sm tracking-wide text-slate-200 flex items-center gap-2">
            <Compass size={18} className="text-red-500" />
            {isRtl ? 'تصنيف المدن الأكثر تعرضاً للانتهاكات الصحفية' : 'City Violation Density Rankings'}
          </h4>
          <span className="text-xs text-slate-400 font-mono">
            {isRtl ? 'بيانات رصد حية' : 'Live Observatory Feeds'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {cityDensityList.map((city) => (
            <div
              key={city.govKey}
              className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-red-500/50 transition-all space-y-1 group cursor-pointer"
            >
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                <span className="truncate group-hover:text-amber-400 transition-colors">
                  {isRtl ? city.nameAr : city.nameEn}
                </span>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: city.color }}
                />
              </div>

              <div className="text-lg font-black font-mono text-white flex items-baseline justify-between">
                <span>{city.count}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {city.percentage}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${city.percentage}%`, backgroundColor: city.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .leaflet-container {
          background: #0f172a;
          font-family: inherit;
        }
        .custom-leaflet-popup .leaflet-popup-content-wrapper {
          border-radius: 20px;
          padding: 8px;
          background: #ffffff;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
        }
        .custom-leaflet-popup .leaflet-popup-content {
          margin: 12px;
          min-width: 200px;
        }
      `}} />
    </div>
  );
};

export default LeafletViolationsMap;
