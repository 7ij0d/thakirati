import React from 'react';
import { RefreshCw, CheckCheck, Trash2, Calendar } from 'lucide-react';
import type { Task } from '../../types';
import { db } from '../../lib/db';
import { sound } from '../../lib/sound';

interface RolloverBannerProps {
  missedTasks: Task[];
  onRolledOver: () => void;
}

export const RolloverBanner: React.FC<RolloverBannerProps> = ({
  missedTasks,
  onRolledOver
}) => {
  if (missedTasks.length === 0) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const handleRollOverAll = async () => {
    sound.playCompletionChime();
    await db.transaction('rw', db.tasks, async () => {
      for (const t of missedTasks) {
        await db.tasks.update(t.id, {
          date: todayStr,
          rolledOverFrom: t.date
        });
      }
    });
    onRolledOver();
  };

  const handleDismissAll = async () => {
    sound.playTactileClick();
    await db.transaction('rw', db.tasks, async () => {
      for (const t of missedTasks) {
        await db.tasks.delete(t.id);
      }
    });
    onRolledOver();
  };

  const handleRollOverSingle = async (taskId: string, originalDate: string) => {
    sound.playTactileClick();
    await db.tasks.update(taskId, {
      date: todayStr,
      rolledOverFrom: originalDate
    });
    onRolledOver();
  };

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-obsidian-900 border border-amber-500/30 p-4 sm:p-5 shadow-subtle-double animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
            <RefreshCw size={20} className="animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-amber-200 text-base">
                مهام سابقة لم تكتمل ({missedTasks.length})
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium">
                تذكير تلقائي
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">
              لاحظنا وجود مهام من الأيام السابقة لم تؤشر عليها بعد. يمكنك ترحيلها إلى قائمة اليوم بضغطة زر حتى لا تنساها!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
          <button
            onClick={handleDismissAll}
            className="tactile-btn px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 flex items-center gap-1.5 transition-colors"
            title="حذف هذه المهام من القائمة"
          >
            <Trash2 size={14} />
            <span>تجاهل وحذف</span>
          </button>
          
          <button
            onClick={handleRollOverAll}
            className="tactile-btn px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-obsidian-950 flex items-center gap-2 shadow-tactile-btn transition-all"
          >
            <CheckCheck size={16} />
            <span>ترحيل الكل إلى اليوم</span>
          </button>
        </div>
      </div>

      {/* Mini List of missed tasks */}
      <div className="mt-4 pt-3 border-t border-amber-500/15 flex flex-wrap gap-2">
        {missedTasks.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-obsidian-950/80 border border-amber-500/20 text-xs text-slate-300"
          >
            <span className="font-medium truncate max-w-[200px]">{t.title}</span>
            <span className="text-[10px] text-amber-400/80 flex items-center gap-1">
              <Calendar size={10} />
              {t.date}
            </span>
            <button
              onClick={() => handleRollOverSingle(t.id, t.date)}
              className="text-amber-400 hover:text-amber-200 font-bold mr-1"
              title="ترحيل هذه المهمة فقط لليوم"
            >
              + ترحيل
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
