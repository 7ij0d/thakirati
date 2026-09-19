import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Tablet, Search, ShieldCheck } from 'lucide-react';
import { sound } from '../../lib/sound';

interface NavbarProps {
  onOpenSync: () => void;
  onOpenWhereIsIt: () => void;
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSync,
  onOpenWhereIsIt,
  activeTab
}) => {
  const [soundActive, setSoundActive] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const datePart = now.toLocaleDateString('ar-LY', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
      const timePart = now.toLocaleTimeString('ar-LY', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setCurrentDateTime(`${datePart} - ${timePart}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSound = () => {
    const nextState = !soundActive;
    setSoundActive(nextState);
    sound.setSoundEnabled(nextState);
    if (nextState) sound.playTactileClick();
  };

  return (
    <header className="sticky top-0 z-40 bg-obsidian-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Date */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center p-1.5 shadow-md shadow-brand-500/20">
            <img src="/logo.svg" alt="ذاكرتي" className="w-full h-full" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-slate-100 tracking-tight">
                ذاكـرتـي
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-950/80 text-brand-300 border border-brand-500/30">
                <ShieldCheck size={10} />
                حفظ محلي فوري
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              {currentDateTime}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Find Item shortcut button if not already in where-is-it */}
          {activeTab !== 'where' && (
            <button
              onClick={onOpenWhereIsIt}
              className="tactile-btn hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-obsidian-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-800 transition-colors"
              title="البحث عن مكان غرض مفقود"
            >
              <Search size={14} className="text-sky-400" />
              <span>وين حطيت؟</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition-all ${
              soundActive
                ? 'bg-obsidian-900 border-slate-800 text-brand-400 hover:bg-slate-800'
                : 'bg-obsidian-950 border-slate-800 text-slate-500'
            }`}
            title={soundActive ? 'كتم النغمات والأصوات' : 'تفعيل النغمات الصوتية'}
          >
            {soundActive ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* iPad & Backup Modal Trigger */}
          <button
            onClick={onOpenSync}
            className="tactile-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white flex items-center gap-1.5 shadow-tactile-btn transition-all"
            title="الربط مع الآيباد وتصدير النسخة الاحتياطية"
          >
            <Tablet size={15} />
            <span className="hidden sm:inline">الآيباد والمزامنة</span>
          </button>
        </div>
      </div>
    </header>
  );
};
