import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Sparkles, Clock, ListTodo, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import type { Task } from '../../types';
import { db } from '../../lib/db';
import { sound } from '../../lib/sound';
import { TaskItem } from './TaskItem';
import { RolloverBanner } from './RolloverBanner';
import { AddTaskModal } from './AddTaskModal';

export const TodayRadar: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [missedTasks, setMissedTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSpontaneousMode, setIsSpontaneousMode] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const loadData = useCallback(async () => {
    // Load today's tasks
    const allTasks = await db.tasks.toArray();
    
    // Today's tasks
    const todayTasks = allTasks.filter(t => t.date === todayStr);
    setTasks(todayTasks);

    // Missed tasks from past days
    const missed = allTasks.filter(t => t.date < todayStr && !t.completed);
    setMissedTasks(missed);
  }, [todayStr]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Separate tasks
  const clockTasks = tasks
    .filter(t => t.isTimeSpecific && !t.completed)
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  const priorityOrder = { urgent: 0, important: 1, normal: 2 };
  const anytimeTasks = tasks
    .filter(t => !t.isTimeSpecific && !t.completed)
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const completedTasks = tasks.filter(t => t.completed);

  const totalTasks = tasks.length;
  const completedCount = completedTasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const openNewTaskModal = (spontaneous: boolean = false) => {
    sound.playTactileClick();
    setIsSpontaneousMode(spontaneous);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner & Daily Progress Card */}
      <div className="elite-card p-5 sm:p-6 bg-gradient-to-br from-obsidian-900 via-obsidian-900 to-slate-900/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="pulse-dot"></span>
              <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
                رادار اليوم المباشر
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 mt-1">
              جدول مهامك وأولويات اليوم
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              لا تضغط على نفسك، ركّز على ما هو أمامك خطوة بخطوة.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => openNewTaskModal(true)}
              className="tactile-btn px-3.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5 transition-all"
              title="سجل إنجازاً قمت به الآن حتى لو لم يكن مجدولاً"
            >
              <Sparkles size={15} />
              <span>إنجاز مفاجئ</span>
            </button>

            <button
              onClick={() => openNewTaskModal(false)}
              className="tactile-btn px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white flex items-center gap-2 shadow-tactile-btn transition-all"
            >
              <Plus size={16} />
              <span>مهمة جديدة</span>
            </button>
          </div>
        </div>

        {/* Live Progress Bar */}
        {totalTasks > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400">
                نسبة إنجاز اليوم ({completedCount} من {totalTasks})
              </span>
              <span className="font-mono font-bold text-brand-400">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-obsidian-950 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-brand-600 to-emerald-500 transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Morning Rollover Alert for Missed Tasks */}
      <RolloverBanner missedTasks={missedTasks} onRolledOver={loadData} />

      {/* Section 1: Clock Tasks (Scheduled by Time) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Clock size={15} />
            </div>
            <h3 className="font-bold text-slate-100 text-sm sm:text-base">
              مهام بموعد وتوقيت محدد ({clockTasks.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">يصدر لها عدّاد وجرس تنبيه</span>
        </div>

        {clockTasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-500 bg-obsidian-950/40">
            لا توجد مهام محددة بوقت حالياً. يمكنك الاسترخاء أو إضافة موعد محدد بالساعة.
          </div>
        ) : (
          <div className="grid gap-2.5">
            {clockTasks.map(t => (
              <TaskItem key={t.id} task={t} onUpdate={loadData} />
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Anytime Today Tasks */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ListTodo size={15} />
            </div>
            <h3 className="font-bold text-slate-100 text-sm sm:text-base">
              مهام مفتوحة لليوم ({anytimeTasks.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">مرتبة حسب الأولوية</span>
        </div>

        {anytimeTasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-500 bg-obsidian-950/40">
            رائع! لا توجد مهام معلقة اليوم.
          </div>
        ) : (
          <div className="grid gap-2.5">
            {anytimeTasks.map(t => (
              <TaskItem key={t.id} task={t} onUpdate={loadData} />
            ))}
          </div>
        )}
      </div>

      {/* Section 3: Completed Tasks Accordion */}
      {completedTasks.length > 0 && (
        <div className="pt-3 border-t border-slate-800">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center justify-between w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>ما أنجزته اليوم ({completedTasks.length})</span>
            </div>
            {showCompleted ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showCompleted && (
            <div className="grid gap-2.5 mt-3 animate-fade-in">
              {completedTasks.map(t => (
                <TaskItem key={t.id} task={t} onUpdate={loadData} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultIsSpontaneous={isSpontaneousMode}
        onAdded={loadData}
      />
    </div>
  );
};
