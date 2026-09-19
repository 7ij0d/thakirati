import React, { useState } from 'react';
import { Target, MapPin, Zap, Award, QrCode } from 'lucide-react';
import { Navbar } from './Navbar';
import { TodayRadar } from '../TodayRadar/TodayRadar';
import { WhereIsIt } from '../WhereIsIt/WhereIsIt';
import { BrainDump } from '../BrainDump/BrainDump';
import { Accomplishments } from '../Accomplishments/Accomplishments';
import { IPadPairingModal } from '../SyncModal/iPadPairingModal';
import { sound } from '../../lib/sound';

export type ActiveTab = 'today' | 'where' | 'brain' | 'done';

export const AppLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('today');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  const switchTab = (tab: ActiveTab) => {
    sound.playTactileClick();
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    {
      id: 'today' as ActiveTab,
      label: 'رادار اليوم',
      icon: Target,
      badge: 'المهام',
      color: 'text-brand-400',
      activeBg: 'bg-brand-500/15 border-brand-500/40 text-brand-300',
    },
    {
      id: 'where' as ActiveTab,
      label: 'وين حطيت؟',
      icon: MapPin,
      badge: 'الأماكن',
      color: 'text-sky-400',
      activeBg: 'bg-sky-500/15 border-sky-500/40 text-sky-300',
    },
    {
      id: 'brain' as ActiveTab,
      label: 'تفريغ وصوت',
      icon: Zap,
      badge: 'فوري',
      color: 'text-purple-400',
      activeBg: 'bg-purple-500/15 border-purple-500/40 text-purple-300',
    },
    {
      id: 'done' as ActiveTab,
      label: 'ما أنجزته',
      icon: Award,
      badge: 'الفخر',
      color: 'text-emerald-400',
      activeBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
    },
  ];

  return (
    <div className="min-h-screen bg-obsidian-950 flex flex-col pb-24 md:pb-8">
      {/* Top Sticky Navbar */}
      <Navbar
        onOpenSync={() => setIsSyncModalOpen(true)}
        onOpenWhereIsIt={() => switchTab('where')}
        activeTab={activeTab}
      />

      {/* Main Content Area with Desktop Sidebar */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-6 flex-1 flex flex-col md:flex-row gap-6">
        {/* Desktop / iPad Sidebar */}
        <aside className="hidden md:flex flex-col w-56 shrink-0 space-y-2 sticky top-20 self-start">
          <div className="p-2 rounded-2xl bg-obsidian-900 border border-slate-800 space-y-1 shadow-subtle-double">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => switchTab(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all text-right ${
                    isActive
                      ? item.activeBg + ' shadow-sm'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={item.color} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <span className="text-[10px] font-normal px-2 py-0.5 rounded-md bg-obsidian-950/80 text-slate-400">
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* iPad quick pair card on desktop sidebar */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-obsidian-900 to-brand-950/40 border border-slate-800 shadow-subtle-double">
            <div className="flex items-center gap-2 text-brand-300 font-bold text-xs mb-1">
              <QrCode size={15} />
              <span>هل تستخدم الآيباد؟</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              امسح الرمز لفتح التطبيق على شاشة الآيباد في أي وقت.
            </p>
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="tactile-btn mt-3 w-full py-1.5 rounded-lg bg-obsidian-950 hover:bg-brand-600/30 border border-slate-700 text-[11px] font-bold text-slate-200 transition-colors"
            >
              عرض رمز الـ QR
            </button>
          </div>
        </aside>

        {/* View Component */}
        <main className="flex-1 min-w-0">
          {activeTab === 'today' && <TodayRadar />}
          {activeTab === 'where' && <WhereIsIt />}
          {activeTab === 'brain' && <BrainDump onNoteConverted={() => switchTab('today')} />}
          {activeTab === 'done' && <Accomplishments />}
        </main>
      </div>

      {/* Mobile & iPad Bottom Navigation Bar (48px+ touch targets) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-obsidian-950/95 backdrop-blur-lg border-t border-slate-800 px-2 py-2">
        <div className="grid grid-cols-4 gap-1 max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => switchTab(item.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all min-h-[48px] ${
                  isActive
                    ? 'bg-slate-800/80 text-brand-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon size={18} className={isActive ? item.color : 'text-slate-400'} />
                <span className="text-[11px] mt-1 leading-none truncate max-w-full">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* iPad Pairing & Sync Modal */}
      <IPadPairingModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />
    </div>
  );
};
