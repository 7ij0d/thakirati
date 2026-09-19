import React, { useState, useEffect } from 'react';
import { X, Mic, MicOff, Clock, Sparkles, Bookmark } from 'lucide-react';
import type { PriorityLevel } from '../../types';
import { db } from '../../lib/db';
import { sound } from '../../lib/sound';
import { SpeechHelper } from '../../lib/speech';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultIsSpontaneous?: boolean;
  onAdded: () => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  defaultIsSpontaneous = false,
  onAdded
}) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [isTimeSpecific, setIsTimeSpecific] = useState(false);
  const [time, setTime] = useState('12:00');
  const [priority, setPriority] = useState<PriorityLevel>('important');
  const [isSpontaneous, setIsSpontaneous] = useState(defaultIsSpontaneous);
  const [isListening, setIsListening] = useState(false);
  const [speechRecognizer, setSpeechRecognizer] = useState<any>(null);

  useEffect(() => {
    setIsSpontaneous(defaultIsSpontaneous);
  }, [defaultIsSpontaneous]);

  if (!isOpen) return null;

  const toggleSpeechRecognition = () => {
    if (isListening && speechRecognizer) {
      speechRecognizer.stop();
      setIsListening(false);
      return;
    }

    if (!SpeechHelper.isSpeechRecognitionSupported()) {
      alert('التعرف الصوتي غير مدعوم في هذا المتصفح، يمكنك الكتابة في الحقل مباشرة.');
      return;
    }

    sound.playTactileClick();
    const recognizer = SpeechHelper.createRecognizer(
      (_interim) => {
        // Show interim in placeholder or live
      },
      (finalText) => {
        setTitle((prev) => (prev ? `${prev} ${finalText}` : finalText));
      },
      (err) => {
        console.warn('Speech error:', err);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    if (recognizer) {
      try {
        recognizer.start();
        setSpeechRecognizer(recognizer);
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    sound.playTactileClick();
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    await db.tasks.add({
      id: 'task-' + Date.now(),
      title: title.trim(),
      notes: notes.trim() || undefined,
      date: todayStr,
      time: isTimeSpecific ? time : undefined,
      isTimeSpecific: isTimeSpecific,
      priority,
      completed: isSpontaneous, // If spontaneous win, already completed!
      completedAt: isSpontaneous ? now : undefined,
      isSpontaneous,
      createdAt: now
    });

    if (isSpontaneous) {
      sound.playCompletionChime();
    }

    setTitle('');
    setNotes('');
    setIsTimeSpecific(false);
    onAdded();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-obsidian-900 border border-slate-700/60 p-5 sm:p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              {isSpontaneous ? <Sparkles size={18} /> : <Bookmark size={18} />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                {isSpontaneous ? 'تسجيل إنجاز مفاجئ' : 'إضافة مهمة جديدة'}
              </h2>
              <p className="text-xs text-slate-400">
                {isSpontaneous 
                  ? 'سجل شيئاً أنجزته للتو حتى وإن لم يكن مجدولاً!' 
                  : 'سجلها فوراً قبل أن تنساها'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Title with Speech Dictation Button */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              عنوان المهمة / ما تريد تذكره <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: الاتصال بعيادة الأسنان، شراء الأدوية..."
                required
                autoFocus
                className="w-full bg-obsidian-950 border border-slate-700 rounded-xl px-4 py-3 pl-12 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'text-slate-400 hover:text-brand-400 hover:bg-slate-800'
                }`}
                title="تحدث بالعربية لتحويل الصوت إلى نص"
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            </div>
            {isListening && (
              <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1 font-medium">
                <span className="pulse-dot-urgent"></span>
                جاري الاستماع لصوتك الآن... تحدث بوضوح
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              تفاصيل أو ملاحظات إضافية (اختياري)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي تفاصيل، أرقام، أو تعليمات لا تريد نسيانها..."
              rows={2}
              className="w-full bg-obsidian-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-none"
            />
          </div>

          {/* Time Specific Toggle (only if not spontaneous) */}
          {!isSpontaneous && (
            <div className="p-3.5 rounded-xl bg-obsidian-950/60 border border-slate-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-brand-400" />
                  <span className="text-xs font-semibold text-slate-200">
                    هل المهمة محددة بساعة وتوقيت معين؟
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTimeSpecific(!isTimeSpecific)}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    isTimeSpecific ? 'bg-brand-600' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      isTimeSpecific ? '-translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {isTimeSpecific && (
                <div className="flex items-center gap-3 pt-2 border-t border-slate-800/80 animate-fade-in">
                  <span className="text-xs text-slate-400">وقت التنبيه:</span>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="bg-obsidian-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono text-brand-300 focus:outline-none focus:border-brand-500"
                  />
                  <span className="text-[11px] text-slate-400">
                    (سيظهر عدّاد تنازلي وجرس تنبيه)
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Priority selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              مستوى الأولوية
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPriority('urgent')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  priority === 'urgent'
                    ? 'bg-red-950/60 border-red-500 text-red-300 shadow-sm'
                    : 'bg-obsidian-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span>عاجل جداً</span>
              </button>

              <button
                type="button"
                onClick={() => setPriority('important')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  priority === 'important'
                    ? 'bg-amber-950/60 border-amber-500 text-amber-300 shadow-sm'
                    : 'bg-obsidian-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>مهم</span>
              </button>

              <button
                type="button"
                onClick={() => setPriority('normal')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  priority === 'normal'
                    ? 'bg-sky-950/60 border-sky-500 text-sky-300 shadow-sm'
                    : 'bg-obsidian-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                <span>عادي</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="tactile-btn px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-tactile-btn flex items-center gap-2"
            >
              {isSpontaneous ? 'حفظ في سجل الإنجاز' : 'إضافة إلى رادار اليوم'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
