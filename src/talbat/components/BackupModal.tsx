import React, { useRef } from 'react';
import { X, Download, Upload } from 'lucide-react';
import { AppData } from '../types';
import { exportDataAsJson } from '../utils/helpers';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: AppData;
  onRestoreData: (data: AppData) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  appData,
  onRestoreData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    const today = new Date().toISOString().split('T')[0];
    exportDataAsJson(appData, `daftar_backup_${today}.json`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string) as AppData;
        if (parsed.orders && parsed.suppliers && parsed.customers) {
          onRestoreData(parsed);
          alert('تم استعادة النسخة الاحتياطية بنجاح!');
          onClose();
        } else {
          alert('الملف غير صالح، يجب أن يحتوي على بيانات الطلبات والموردين.');
        }
      } catch (err) {
        alert('حدث خطأ أثناء قراءة ملف النسخة الاحتياطية.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-[16px] w-full max-w-md border border-line shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-ink text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brass text-white flex items-center justify-center font-bold">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-cairo">النسخ الاحتياطي والبيانات</h2>
              <p className="text-xs text-ink-muted">حفظ واستعادة سجلات الدفتر</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-ink-muted hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs sm:text-sm">
          {/* Summary */}
          <div className="p-3 bg-paper rounded-[10px] border border-paper-alt flex justify-between text-xs font-semibold">
            <span className="text-copy-muted">إجمالي السجلات المحفوظة:</span>
            <span className="text-ink">
              {appData.orders.length} طلب | {appData.suppliers.length} مورد | {appData.returns.length} مرتجع
            </span>
          </div>

          {/* Export button */}
          <div className="p-4 bg-white border border-line rounded-[12px] space-y-2">
            <div className="font-bold text-ink flex items-center gap-1.5">
              <Download className="w-4 h-4 text-done" />
              <span>تصدير نسخة احتياطية (ملف JSON)</span>
            </div>
            <p className="text-xs text-copy-muted leading-relaxed">
              قم بتحميل نسخة من كل بيانات المحل وحفظها على هاتفك أو جهاز الكمبيوتر لضمان عدم ضياعها.
            </p>
            <button
              onClick={handleExport}
              className="w-full mt-2 py-2.5 bg-ink hover:bg-ink-light text-white font-bold rounded-[8px] text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>تحميل ملف النسخة الاحتياطية الآن</span>
            </button>
          </div>

          {/* Import button */}
          <div className="p-4 bg-white border border-line rounded-[12px] space-y-2">
            <div className="font-bold text-ink flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-brass" />
              <span>استيراد واسترجاع نسخة سابقة</span>
            </div>
            <p className="text-xs text-copy-muted leading-relaxed">
              اختر ملف نسخة احتياطية بصيغة JSON سبق لك تصديره لاستعادة البيانات.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full mt-2 py-2.5 bg-paper-warm hover:bg-pending-soft text-brass border border-line-soft font-bold rounded-[8px] text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>اختيار ملف للاستيراد</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
