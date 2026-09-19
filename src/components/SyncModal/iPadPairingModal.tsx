import React, { useState } from 'react';
import { X, Tablet, Download, Upload, QrCode, Check, Copy, Sparkles } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { exportAllDataAsJSON, importDataFromJSON } from '../../lib/sync';
import { sound } from '../../lib/sound';

interface IPadPairingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored?: () => void;
}

export const IPadPairingModal: React.FC<IPadPairingModalProps> = ({
  isOpen,
  onClose,
  onDataRestored
}) => {
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  // Current network URL hint
  const currentUrl = window.location.href;

  const handleCopyLink = () => {
    sound.playTactileClick();
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = async () => {
    sound.playTactileClick();
    await exportAllDataAsJSON();
    sound.playCompletionChime();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sound.playTactileClick();
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const success = await importDataFromJSON(content);
      if (success) {
        sound.playCompletionChime();
        setImportStatus('تمت استعادة كافة البيانات بنجاح!');
        setTimeout(() => {
          setImportStatus(null);
          if (onDataRestored) onDataRestored();
          onClose();
        }, 1200);
      } else {
        setImportStatus('خطأ: الملف غير صالح.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-obsidian-900 border border-slate-700 p-5 sm:p-6 shadow-2xl relative my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Tablet size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                الربط مع الآيباد والمزامنة
              </h2>
              <p className="text-xs text-slate-400">
                افتح تطبيق "ذاكرتي" على شاشة الآيباد في ثوانٍ معدودة
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

        {/* Content */}
        <div className="mt-5 space-y-6">
          {/* Section 1: QR Code for iPad */}
          <div className="p-5 rounded-2xl bg-obsidian-950 border border-slate-800 flex flex-col sm:flex-row items-center gap-5">
            <div className="bg-white p-3 rounded-xl shadow-lg shrink-0">
              <QRCodeSVG value={currentUrl} size={130} level="M" />
            </div>

            <div className="space-y-2 text-center sm:text-right">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-950 text-brand-300 border border-brand-500/30">
                <QrCode size={12} />
                امسح بكاميرا الآيباد
              </span>
              <h4 className="text-sm font-bold text-slate-200">
                طريقة التثبيت السريعة على الآيباد:
              </h4>
              <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside pr-1">
                <li>افتح تطبيق الكاميرا في الآيباد ووجّهه للرمز أعلاه.</li>
                <li>اضغط على الرابط لفتحه في Safari.</li>
                <li>اضغط زر المشاركة (Share) ثم <strong>"إضافة إلى الشاشة الرئيسية"</strong>.</li>
              </ol>

              {/* Copy URL */}
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="bg-obsidian-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 font-mono flex-1 select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="tactile-btn px-3 py-1 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white flex items-center gap-1 shadow-sm"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Backup & Portability */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              النسخ الاحتياطي وحفظ البيانات
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleExport}
                className="tactile-btn p-3.5 rounded-xl bg-obsidian-950 hover:bg-slate-800/80 border border-slate-800 flex items-center gap-3 text-right group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Download size={16} />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">
                    تصدير نسخة احتياطية
                  </h5>
                  <p className="text-[11px] text-slate-500">تحميل ملف JSON كامل</p>
                </div>
              </button>

              <label className="tactile-btn cursor-pointer p-3.5 rounded-xl bg-obsidian-950 hover:bg-slate-800/80 border border-slate-800 flex items-center gap-3 text-right group">
                <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                  <Upload size={16} />
                </div>
                <div className="flex-1">
                  <h5 className="text-xs font-bold text-slate-200 group-hover:text-sky-300 transition-colors">
                    استيراد نسخة سابقة
                  </h5>
                  <p className="text-[11px] text-slate-500">استعادة المهام والأماكن</p>
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>

            {importStatus && (
              <p className="text-xs text-center font-bold text-brand-300 mt-2 animate-fade-in">
                {importStatus}
              </p>
            )}
          </div>

          {/* Section 3: Cloud Deployment info */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-brand-950/40 to-slate-900 border border-brand-500/20 text-xs text-slate-300 flex items-start gap-2.5">
            <Sparkles size={16} className="text-brand-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-100">نشر التطبيق على الإنترنت مجاناً:</span>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                التطبيق مجهّز للنشر بضغطة زر على Vercel أو Cloudflare Pages ليكون لك رابط خاص تفتحه من أي مكان في العالم!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
