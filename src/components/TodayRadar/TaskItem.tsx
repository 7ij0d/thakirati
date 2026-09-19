import React from 'react';
import { Check, Clock, Trash2, Calendar, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Task } from '../../types';
import { db } from '../../lib/db';
import { sound } from '../../lib/sound';
import { TimeRemainingBadge } from './TimeRemainingBadge';

interface TaskItemProps {
  task: Task;
  onUpdate: () => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onUpdate }) => {
  const toggleCompleted = async () => {
    const nextCompleted = !task.completed;
    if (nextCompleted) {
      sound.playCompletionChime();
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#0284C7', '#38BDF8', '#10B981', '#F59E0B']
        });
      } catch {
        // Confetti fallback
      }
      if (navigator.vibrate) {
        navigator.vibrate([30, 40, 30]);
      }
    } else {
      sound.playTactileClick();
    }

    await db.tasks.update(task.id, {
      completed: nextCompleted,
      completedAt: nextCompleted ? new Date().toISOString() : undefined
    });
    onUpdate();
  };

  const deleteTask = async (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playTactileClick();
    await db.tasks.delete(task.id);
    onUpdate();
  };

  const priorityStyles = {
    urgent: 'border-red-500/30 bg-red-950/15 hover:border-red-500/50',
    important: 'border-amber-500/30 bg-amber-950/15 hover:border-amber-500/50',
    normal: 'border-slate-700/50 bg-obsidian-900/60 hover:border-slate-600',
  };

  const priorityLabel = {
    urgent: { text: 'عاجل جداً', class: 'bg-red-950/80 text-red-300 border-red-500/40' },
    important: { text: 'مهم', class: 'bg-amber-950/80 text-amber-300 border-amber-500/40' },
    normal: { text: 'عادي', class: 'bg-slate-800/80 text-slate-300 border-slate-700' },
  };

  return (
    <div
      onClick={toggleCompleted}
      className={`group cursor-pointer rounded-xl border p-4 transition-all duration-200 select-none ${
        task.completed
          ? 'bg-obsidian-950/40 border-slate-800/60 opacity-60'
          : priorityStyles[task.priority]
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Tactile Checkbox */}
        <button
          type="button"
          aria-label={task.completed ? 'إلغاء التحديد' : 'تحديد كمكتمل'}
          className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
            task.completed
              ? 'bg-emerald-500 border-emerald-400 text-white shadow-sm'
              : 'border-slate-600 bg-obsidian-950 group-hover:border-brand-400'
          }`}
        >
          {task.completed && <Check size={14} strokeWidth={3} />}
        </button>

        {/* Task Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {/* Clock & Countdown badge if time specific */}
            {task.isTimeSpecific && task.time && !task.completed && (
              <TimeRemainingBadge timeStr={task.time} dateStr={task.date} />
            )}

            {/* Priority Tag */}
            {!task.completed && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  priorityLabel[task.priority].class
                }`}
              >
                {priorityLabel[task.priority].text}
              </span>
            )}

            {/* Rolled over from yesterday */}
            {task.rolledOverFrom && !task.completed && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Calendar size={10} />
                مرحلة من {task.rolledOverFrom}
              </span>
            )}

            {/* Spontaneous win */}
            {task.isSpontaneous && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Sparkles size={10} />
                إنجاز مباشر
              </span>
            )}

            {/* Scheduled Time badge */}
            {task.isTimeSpecific && task.time && (
              <span className="text-xs font-mono text-brand-300 font-semibold flex items-center gap-1">
                <Clock size={12} />
                {task.time}
              </span>
            )}
          </div>

          <h4
            className={`text-sm font-semibold transition-all ${
              task.completed
                ? 'line-through text-slate-500'
                : 'text-slate-100'
            }`}
          >
            {task.title}
          </h4>

          {task.notes && (
            <p
              className={`text-xs mt-1 leading-relaxed ${
                task.completed ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              {task.notes}
            </p>
          )}
        </div>

        {/* Delete button on hover */}
        <button
          onClick={deleteTask}
          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition-all"
          title="حذف المهمة"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};
