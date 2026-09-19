import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Send, Radio, Trash2, ArrowUpRight, Play, Pause, Zap } from 'lucide-react';
import type { QuickNote } from '../../types';
import { db } from '../../lib/db';
import { sound } from '../../lib/sound';
import { SpeechHelper, AudioRecorder } from '../../lib/speech';

interface BrainDumpProps {
  onNoteConverted?: () => void;
}

export const BrainDump: React.FC<BrainDumpProps> = ({ onNoteConverted }) => {
  const [notes, setNotes] = useState<QuickNote[]>([]);
  const [textInput, setTextInput] = useState('');
  const [isListeningSpeech, setIsListeningSpeech] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioRecorderInstance, setAudioRecorderInstance] = useState<AudioRecorder | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [activeAudioPlaying, setActiveAudioPlaying] = useState<string | null>(null);
  const [currentAudioElement, setCurrentAudioElement] = useState<HTMLAudioElement | null>(null);

  const loadNotes = useCallback(async () => {
    const all = await db.quickNotes.toArray();
    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setNotes(all);
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Handle Recording Timer
  useEffect(() => {
    let timer: any;
    if (isRecordingAudio) {
      timer = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecordingAudio]);

  // Speech Recognition (Speech-to-Text)
  const toggleSpeechRecognition = () => {
    if (isListeningSpeech) {
      setIsListeningSpeech(false);
      return;
    }

    if (!SpeechHelper.isSpeechRecognitionSupported()) {
      alert('التعرف الصوتي غير مدعوم في متصفحك.');
      return;
    }

    sound.playTactileClick();
    const recognizer = SpeechHelper.createRecognizer(
      () => {},
      (finalText) => {
        setTextInput((prev) => (prev ? `${prev} ${finalText}` : finalText));
      },
      () => setIsListeningSpeech(false),
      () => setIsListeningSpeech(false)
    );

    if (recognizer) {
      try {
        recognizer.start();
        setIsListeningSpeech(true);
      } catch {
        setIsListeningSpeech(false);
      }
    }
  };

  // Standalone Voice Memo Recorder
  const toggleAudioRecording = async () => {
    if (isRecordingAudio && audioRecorderInstance) {
      // Stop recording
      sound.playTactileClick();
      try {
        const result = await audioRecorderInstance.stop();
        setIsRecordingAudio(false);
        setAudioRecorderInstance(null);

        // Save audio note
        await db.quickNotes.add({
          id: 'note-' + Date.now(),
          content: 'مذكرة صوتية مسجلة',
          type: 'voice',
          audioDataUrl: result.audioDataUrl,
          durationSeconds: result.durationSeconds,
          createdAt: new Date().toISOString()
        });
        sound.playCompletionChime();
        loadNotes();
      } catch (err) {
        console.error('Stop recording error:', err);
        setIsRecordingAudio(false);
      }
      return;
    }

    // Start recording
    sound.playTactileClick();
    const recorder = new AudioRecorder();
    const started = await recorder.start();
    if (started) {
      setAudioRecorderInstance(recorder);
      setIsRecordingAudio(true);
    } else {
      alert('تعذر فتح الميكروفون. يرجى التأكد من إعطاء إذن الوصول للصوت في المتصفح.');
    }
  };

  const handleSaveTextNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    sound.playTactileClick();
    await db.quickNotes.add({
      id: 'note-' + Date.now(),
      content: textInput.trim(),
      type: 'text',
      createdAt: new Date().toISOString()
    });

    setTextInput('');
    sound.playCompletionChime();
    loadNotes();
  };

  const handleDelete = async (id: string) => {
    sound.playTactileClick();
    await db.quickNotes.delete(id);
    loadNotes();
  };

  const convertToTask = async (note: QuickNote) => {
    sound.playCompletionChime();
    const todayStr = new Date().toISOString().split('T')[0];
    await db.tasks.add({
      id: 'task-' + Date.now(),
      title: note.content,
      date: todayStr,
      isTimeSpecific: false,
      priority: 'important',
      completed: false,
      createdAt: new Date().toISOString()
    });

    await db.quickNotes.delete(note.id);
    loadNotes();
    if (onNoteConverted) onNoteConverted();
  };

  const playAudio = (audioUrl: string, noteId: string) => {
    if (currentAudioElement) {
      currentAudioElement.pause();
      if (activeAudioPlaying === noteId) {
        setActiveAudioPlaying(null);
        return;
      }
    }

    const audio = new Audio(audioUrl);
    audio.onended = () => {
      setActiveAudioPlaying(null);
    };
    audio.play();
    setCurrentAudioElement(audio);
    setActiveAudioPlaying(noteId);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Capture Box */}
      <div className="elite-card p-5 sm:p-6 bg-gradient-to-br from-obsidian-900 via-obsidian-900 to-purple-950/30">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
            التفريغ الدماغي اللحظي
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100">
          فرّغ أفكارك قبل أن تنساها
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          اكتب أي فكرة أو مهمة أو سجلها بصوتك فوراً. يمكنك لاحقاً تحويلها لمهمة يومية أو موقع غرض.
        </p>

        {/* Input Bar */}
        <form onSubmit={handleSaveTextNote} className="mt-5">
          <div className="relative">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="اكتب هنا أي فكرة تخطر ببالك الآن..."
              className="w-full bg-obsidian-950 border border-slate-700 rounded-2xl py-3.5 pr-4 pl-32 text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />

            {/* Microphones & Action Buttons inside input */}
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {/* Speech-to-Text Button */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-2 rounded-xl transition-all ${
                  isListeningSpeech
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'text-slate-400 hover:text-purple-400 hover:bg-slate-800'
                }`}
                title="تحدث بالعربية لتحويل صوتك إلى نص"
              >
                {isListeningSpeech ? <MicOff size={17} /> : <Mic size={17} />}
              </button>

              {/* Submit text */}
              <button
                type="submit"
                disabled={!textInput.trim()}
                className="tactile-btn p-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:pointer-events-none text-white transition-all shadow-tactile-btn"
                title="حفظ الملاحظة"
              >
                <Send size={17} className="rotate-180" />
              </button>
            </div>
          </div>
        </form>

        {/* Dedicated Audio Memo Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Radio size={14} className="text-purple-400" />
            <span>أو سجل مذكرة صوتية مباشرة:</span>
          </div>

          <button
            type="button"
            onClick={toggleAudioRecording}
            className={`tactile-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              isRecordingAudio
                ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                : 'bg-obsidian-950 hover:bg-slate-800 border border-slate-700 text-slate-200'
            }`}
          >
            {isRecordingAudio ? (
              <>
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                <span>إيقاف التسجيل ({recordingSeconds} ثانية)</span>
              </>
            ) : (
              <>
                <Mic size={14} className="text-purple-400" />
                <span>تسجيل صوتي فوري</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-200 text-sm sm:text-base flex items-center gap-2">
          <Zap size={16} className="text-purple-400" />
          <span>الأفكار والمذكرات المسجلة ({notes.length})</span>
        </h3>

        {notes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-xs text-slate-500 bg-obsidian-950/40">
            لا توجد أفكار مسجلة حالياً. أي شيء يطرأ في ذهنك، فرّغه هنا فوراً!
          </div>
        ) : (
          <div className="grid gap-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="elite-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                    {note.type === 'voice' ? <Radio size={16} /> : <Zap size={16} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    {note.type === 'voice' && note.audioDataUrl ? (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => playAudio(note.audioDataUrl!, note.id)}
                          className="tactile-btn w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shrink-0"
                          title="تشغيل المذكرة الصوتية"
                        >
                          {activeAudioPlaying === note.id ? <Pause size={14} /> : <Play size={14} className="mr-0.5" />}
                        </button>
                        <div className="text-xs">
                          <p className="font-bold text-slate-200">تسجيل صوتي</p>
                          <span className="text-slate-500 text-[10px]">
                            {note.durationSeconds ? `${note.durationSeconds} ثانية` : 'صوت'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-slate-100 leading-relaxed break-words">
                        {note.content}
                      </p>
                    )}

                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {new Date(note.createdAt).toLocaleDateString('ar-LY', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {note.type === 'text' && (
                    <button
                      onClick={() => convertToTask(note)}
                      className="tactile-btn px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-950/80 hover:bg-brand-900 border border-brand-500/30 text-brand-300 flex items-center gap-1.5 transition-all"
                      title="تحويل هذه الفكرة إلى مهمة في رادار اليوم"
                    >
                      <ArrowUpRight size={14} />
                      <span>تحويل لمهمة اليوم</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="حذف"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
