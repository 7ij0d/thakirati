import React, { useState } from 'react';
import { X, Mic, MicOff, Camera, MapPin, Tag } from 'lucide-react';
import type { RoomCategory } from '../../types';
import { db } from '../../lib/db';
import { sound } from '../../lib/sound';
import { SpeechHelper } from '../../lib/speech';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void;
  initialItem?: any;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  onAdded,
  initialItem
}) => {
  const [name, setName] = useState(initialItem?.name || '');
  const [location, setLocation] = useState(initialItem?.location || '');
  const [room, setRoom] = useState<RoomCategory>(initialItem?.room || 'bedroom');
  const [notes, setNotes] = useState(initialItem?.notes || '');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(initialItem?.photoUrl);
  const [isListening, setIsListening] = useState(false);
  const [activeSpeechField, setActiveSpeechField] = useState<'name' | 'location'>('name');

  if (!isOpen) return null;

  const roomLabels: Record<RoomCategory, string> = {
    bedroom: 'غرفة النوم',
    office: 'المكتب',
    car: 'السيارة',
    bag: 'الحقيبة',
    living: 'الصالة / المدخل',
    kitchen: 'المطبخ',
    other: 'مكان آخر',
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const toggleSpeech = (field: 'name' | 'location') => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    if (!SpeechHelper.isSpeechRecognitionSupported()) {
      alert('التعرف الصوتي غير مدعوم في هذا المتصفح');
      return;
    }

    setActiveSpeechField(field);
    sound.playTactileClick();

    const recognizer = SpeechHelper.createRecognizer(
      () => {},
      (text) => {
        if (field === 'name') {
          setName((prev: string) => (prev ? `${prev} ${text}` : text));
        } else {
          setLocation((prev: string) => (prev ? `${prev} ${text}` : text));
        }
      },
      () => setIsListening(false),
      () => setIsListening(false)
    );

    if (recognizer) {
      try {
        recognizer.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) return;

    sound.playTactileClick();
    const now = new Date().toISOString();

    if (initialItem) {
      await db.items.update(initialItem.id, {
        name: name.trim(),
        location: location.trim(),
        room,
        notes: notes.trim() || undefined,
        photoUrl,
        updatedAt: now
      });
    } else {
      await db.items.add({
        id: 'item-' + Date.now(),
        name: name.trim(),
        location: location.trim(),
        room,
        notes: notes.trim() || undefined,
        photoUrl,
        updatedAt: now
      });
    }

    sound.playCompletionChime();
    onAdded();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-obsidian-900 border border-slate-700/60 p-5 sm:p-6 shadow-2xl relative my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <MapPin size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                {initialItem ? 'تعديل مكان الغرض' : 'أين وضعت الغرض؟'}
              </h2>
              <p className="text-xs text-slate-400">
                سجل موقعه بالتفصيل لتجده بلحظة عندما تبحث عنه
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
          {/* Item Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              اسم الغرض <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: جواز السفر، مفتاح الخزنة، شاحن الآيباد..."
                required
                className="w-full bg-obsidian-950 border border-slate-700 rounded-xl px-4 py-3 pl-12 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={() => toggleSpeech('name')}
                className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isListening && activeSpeechField === 'name'
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'text-slate-400 hover:text-brand-400 hover:bg-slate-800'
                }`}
                title="إملاء صوتي باللغة العربية"
              >
                {isListening && activeSpeechField === 'name' ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            </div>
          </div>

          {/* Exact Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              مكان وجوده بالتفصيل الدقيق <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <textarea
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="مثال: الدرج الثاني لمكتب الغرفة، داخل المظروف الأزرق تحت ملف الأوراق..."
                required
                rows={2}
                className="w-full bg-obsidian-950 border border-slate-700 rounded-xl px-4 py-2.5 pl-12 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 resize-none"
              />
              <button
                type="button"
                onClick={() => toggleSpeech('location')}
                className={`absolute left-2.5 top-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isListening && activeSpeechField === 'location'
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'text-slate-400 hover:text-brand-400 hover:bg-slate-800'
                }`}
                title="إملاء صوتي للموقع"
              >
                {isListening && activeSpeechField === 'location' ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            </div>
          </div>

          {/* Room Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              تصنيف الغرفة أو المنطقة
            </label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(roomLabels) as RoomCategory[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRoom(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    room === key
                      ? 'bg-brand-600 text-white border-brand-500 shadow-sm'
                      : 'bg-obsidian-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {roomLabels[key]}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Photo Attachment */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              صورة للمكان أو الغرض (اختياري لتسهيل التذكر البصري)
            </label>
            <div className="flex items-center gap-3">
              <label className="tactile-btn cursor-pointer px-4 py-2.5 rounded-xl border border-slate-700 bg-obsidian-950 hover:bg-slate-800 text-xs font-medium text-slate-200 flex items-center gap-2">
                <Camera size={16} className="text-brand-400" />
                <span>التقاط بالكاميرا أو اختيار صورة</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoCapture}
                  className="hidden"
                />
              </label>

              {photoUrl && (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-700">
                  <img src={photoUrl} alt="معاينة" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotoUrl(undefined)}
                    className="absolute inset-0 bg-red-950/80 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    title="حذف الصورة"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              ملاحظة تذكيرية إضافية (اختياري)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: يرجى إرجاعه لمكانه فور الانتهاء..."
              className="w-full bg-obsidian-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
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
              <Tag size={15} />
              <span>{initialItem ? 'حفظ التعديلات' : 'حفظ موقع الغرض'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
