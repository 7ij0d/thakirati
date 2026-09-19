import React, { useState, useEffect, useCallback } from 'react';
import { Award, CheckCircle2, Sparkles, Clock, Undo2 } from 'lucide-react';
import type { Task } from '../../types';
import { db } from '../../lib/db';
import { sound } from '../../lib/sound';

export const Accomplishments: React.FC = () => {
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const todayStr = new Date().toISOString().split('T')[0];

  const loadCompletedTasks = useCallback(async () => {
    const all = await db.tasks.toArray();
    // Tasks completed today
    const doneToday = all.filter(
      (t) => t.completed && (t.date === todayStr || t.completedAt?.startsWith(todayStr))
    );
    doneToday.sort((a, b) => {
      const timeA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const timeB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return timeB - timeA;
    });
    setCompletedTasks(doneToday);
  }, [todayStr]);

  useEffect(() => {
    loadCompletedTasks();
  }, [loadCompletedTasks]);

  const handleUndo = async (taskId: string) => {
    sound.playTactileClick();
    await db.tasks.update(taskId, {
      completed: false,
      completedAt: undefined
    });
    loadCompletedTasks();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Celebration Header */}
      <div className="elite-card p-5 sm:p-6 bg-gradient-to-br from-obsidian-900 via-obsidian-900 to-emerald-950/30">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            سجل الفخر والإنجاز
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
              <span>ما أنجزته اليوم</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-mono border border-emerald-500/30">
                {completedTasks.length} مهام
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              حتى الأشياء البسيطة تستحق الاحتفال. توثيق ما أنجزته يعطيك طاقة إيجابية وشعوراً بالسيطرة!
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 self-start sm:self-center">
            <Award size={26} />
          </div>
        </div>
      </div>

      {/* Completed Tasks List */}
      <div className="space-y-3">
        {completedTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-10 text-center bg-obsidian-950/30">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/60 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="font-bold text-slate-300 text-base">لم تسجل إنجازات لليوم بعد</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              عندما تضع علامة صح على أي مهمة في رادار اليوم، أو تسجل إنجازاً مفاجئاً، ستظهر هنا بفخر!
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="elite-card p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 sm:mt-0">
                    <CheckCircle2 size={16} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-bold text-emerald-300">تم الإنجاز</span>
                      {task.isSpontaneous && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <Sparkles size={10} />
                          إنجاز مفاجئ
                        </span>
                      )}
                      {task.completedAt && (
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                          <Clock size={11} />
                          {new Date(task.completedAt).toLocaleTimeString('ar-LY', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-semibold text-slate-200">
                      {task.title}
                    </h4>

                    {task.notes && (
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {task.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Undo Button */}
                <button
                  onClick={() => handleUndo(task.id)}
                  className="tactile-btn text-xs font-medium px-3 py-1.5 rounded-lg bg-obsidian-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 flex items-center gap-1.5 shrink-0"
                  title="إعادة المهمة للقائمة النشطة"
                >
                  <Undo2 size={13} />
                  <span>تراجع</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
