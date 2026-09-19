import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, MapPin, Edit3, Trash2, Calendar, Image as ImageIcon, X } from 'lucide-react';
import type { ItemLocation, RoomCategory } from '../../types';
import { db } from '../../lib/db';
import { sound } from '../../lib/sound';
import { AddItemModal } from './AddItemModal';

export const WhereIsIt: React.FC = () => {
  const [items, setItems] = useState<ItemLocation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<RoomCategory | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemLocation | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const roomLabels: Record<RoomCategory, string> = {
    bedroom: 'غرفة النوم',
    office: 'المكتب',
    car: 'السيارة',
    bag: 'الحقيبة',
    living: 'الصالة / المدخل',
    kitchen: 'المطبخ',
    other: 'مكان آخر',
  };

  const loadItems = useCallback(async () => {
    const all = await db.items.toArray();
    // Sort recently updated first
    all.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    setItems(all);
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من حذف مكان "${name}"؟`)) {
      sound.playTactileClick();
      await db.items.delete(id);
      loadItems();
    }
  };

  const openEditModal = (item: ItemLocation) => {
    sound.playTactileClick();
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    sound.playTactileClick();
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRoom = selectedRoom === 'all' || item.room === selectedRoom;

    return matchesSearch && matchesRoom;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header & Quick Search */}
      <div className="elite-card p-5 sm:p-6 bg-gradient-to-br from-obsidian-900 via-obsidian-900 to-sky-950/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                خزينة الأماكن
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 mt-1">
              وين حطيت أشيائي؟
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              ابحث فوراً عن أي غرض نسيت مكانه، أو سجّل موقع غرض وضعته للتو.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="tactile-btn self-start sm:self-center px-4 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-2 shadow-tactile-btn transition-all shrink-0"
          >
            <Plus size={16} />
            <span>تسجيل مكان غرض جديد</span>
          </button>
        </div>

        {/* Big Search Input */}
        <div className="mt-5 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث هنا عن: مفتاح، جواز، شاحن، أوراق، بطاقة..."
            className="w-full bg-obsidian-950 border border-slate-700/80 rounded-2xl py-3.5 pr-11 pl-11 text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 shadow-inner"
          />
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-200"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category Pills Filter */}
        <div className="mt-4 flex flex-wrap gap-1.5 sm:gap-2">
          <button
            onClick={() => setSelectedRoom('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              selectedRoom === 'all'
                ? 'bg-sky-600 text-white border-sky-500 shadow-sm'
                : 'bg-obsidian-950/80 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            الكل ({items.length})
          </button>
          {(Object.keys(roomLabels) as RoomCategory[]).map((key) => {
            const count = items.filter((i) => i.room === key).length;
            if (count === 0 && selectedRoom !== key) return null;
            return (
              <button
                key={key}
                onClick={() => setSelectedRoom(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                  selectedRoom === key
                    ? 'bg-sky-600 text-white border-sky-500 shadow-sm'
                    : 'bg-obsidian-950/80 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{roomLabels[key]}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Items Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 p-10 text-center bg-obsidian-950/30">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/60 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <MapPin size={24} />
          </div>
          <h3 className="font-bold text-slate-300 text-base">لا توجد نتائج</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `لم نعثر على أي غرض يطابق "${searchQuery}". جرب كلمة أخرى أو أضف هذا الغرض الآن.`
              : 'لم تسجل أي أغراض في هذا القسم بعد.'}
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 inline-flex items-center gap-2"
          >
            <Plus size={14} />
            <span>تسجيل غرض جديد</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="elite-card p-4 sm:p-5 flex flex-col justify-between group relative overflow-hidden"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-950/70 text-sky-300 border border-sky-500/30">
                      {roomLabels[item.room]}
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Calendar size={11} />
                      {new Date(item.updatedAt).toLocaleDateString('ar-LY', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 transition-colors"
                      title="تعديل المكان"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="حذف"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-100">
                  {item.name}
                </h3>

                {/* Location Callout Banner */}
                <div className="mt-3 p-3 rounded-xl bg-obsidian-950/90 border border-sky-500/20 flex items-start gap-2.5">
                  <MapPin size={17} className="text-sky-400 shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-sky-100 leading-relaxed">
                    {item.location}
                  </p>
                </div>

                {item.notes && (
                  <p className="text-xs text-slate-400 mt-2.5 leading-relaxed bg-obsidian-950/40 p-2 rounded-lg border border-slate-800/60">
                    💡 <span className="font-medium text-slate-300">ملاحظة:</span> {item.notes}
                  </p>
                )}
              </div>

              {/* Bottom bar with optional photo thumbnail & quick edit */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                {item.photoUrl ? (
                  <button
                    onClick={() => setPreviewPhoto(item.photoUrl!)}
                    className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 font-medium"
                  >
                    <ImageIcon size={14} />
                    <span>عرض صورة المكان</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-600">بدون صورة</span>
                )}

                <button
                  onClick={() => openEditModal(item)}
                  className="tactile-btn text-xs font-semibold px-3 py-1.5 rounded-lg bg-obsidian-950 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5"
                >
                  <Edit3 size={13} />
                  <span>تغيير مكانه</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onAdded={loadItems}
        initialItem={editingItem}
      />

      {/* Photo Preview Modal */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/90 backdrop-blur-md"
        >
          <div className="relative max-w-2xl w-full bg-obsidian-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-3 left-3 w-8 h-8 rounded-full bg-obsidian-950/80 text-white flex items-center justify-center hover:bg-red-500 transition-colors z-10"
            >
              <X size={18} />
            </button>
            <img src={previewPhoto} alt="مكان الغرض" className="w-full max-h-[80vh] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};
