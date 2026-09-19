import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { sound } from '../../lib/sound';

interface TimeRemainingBadgeProps {
  timeStr: string; // "HH:mm"
  dateStr: string; // "YYYY-MM-DD"
  onDueAlarm?: () => void;
}

export const TimeRemainingBadge: React.FC<TimeRemainingBadgeProps> = ({
  timeStr,
  dateStr,
  onDueAlarm
}) => {
  const [diffMinutes, setDiffMinutes] = useState<number | null>(null);
  const [hasAlarmed, setHasAlarmed] = useState(false);

  useEffect(() => {
    const calculateDiff = () => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const targetDate = new Date(`${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
      const now = new Date();
      
      const diffMs = targetDate.getTime() - now.getTime();
      const diffMins = Math.round(diffMs / (1000 * 60));
      setDiffMinutes(diffMins);

      // Trigger alarm if just reached (between -1 and 0 minutes) and hasn't alarmed yet
      if (diffMins <= 0 && diffMins >= -2 && !hasAlarmed) {
        setHasAlarmed(true);
        sound.playScheduledAlarm();
        if (onDueAlarm) onDueAlarm();
      }
    };

    calculateDiff();
    const interval = setInterval(calculateDiff, 15000); // update every 15s
    return () => clearInterval(interval);
  }, [timeStr, dateStr, hasAlarmed, onDueAlarm]);

  if (diffMinutes === null) return null;

  if (diffMinutes < 0) {
    const overdueMins = Math.abs(diffMinutes);
    const overdueText = overdueMins > 60 
      ? `فات موعدها منذ ${Math.floor(overdueMins / 60)} ساعة`
      : `فات موعدها منذ ${overdueMins} دقيقة`;

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-950/70 border border-red-500/30 text-red-300">
        <span className="pulse-dot-urgent"></span>
        <AlertCircle size={12} />
        <span>{overdueText}</span>
      </span>
    );
  }

  if (diffMinutes === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-900/60 border border-red-400 text-red-200 animate-pulse">
        <span className="pulse-dot-urgent"></span>
        <span>حان الموعد الآن!</span>
      </span>
    );
  }

  if (diffMinutes <= 30) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/70 border border-amber-500/40 text-amber-300">
        <span className="pulse-dot-warning"></span>
        <Clock size={12} />
        <span>متبقي {diffMinutes} دقيقة</span>
      </span>
    );
  }

  const hours = Math.floor(diffMinutes / 60);
  const remainingMins = diffMinutes % 60;
  const timeText = hours > 0 
    ? `متبقي ${hours} س و ${remainingMins} د`
    : `متبقي ${diffMinutes} دقيقة`;

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-obsidian-800/80 border border-slate-700/60 text-slate-300">
      <Clock size={12} className="text-brand-400" />
      <span>{timeText}</span>
    </span>
  );
};
