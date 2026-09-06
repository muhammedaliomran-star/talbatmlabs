import React, { useState } from 'react';
import {
  X,
  LogOut,
  CheckCircle2,
  AlertCircle,
  HardDriveDownload,
} from 'lucide-react';
import { User, UserRole } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
  onOpenBackup: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onLogout,
  onOpenBackup,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [password] = useState(currentUser.password || '');
  const [role] = useState<UserRole>(currentUser.role);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('اسم المستخدم مطلوب');
      return;
    }

    const updated: User = {
      ...currentUser,
      name: name.trim(),
      phone: phone.trim(),
      password: password.trim() || currentUser.password,
      role,
    };

    onUpdateUser(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs font-tajawal animate-in fade-in duration-200 sm:items-center sm:p-4">
      <div className="flex max-h-[94dvh] w-full max-w-md flex-col overflow-hidden rounded-t-[26px] border border-line bg-white text-right shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-[22px]">
        {/* Grab handle (mobile sheet) */}
        <div className="sm:hidden bg-ink pt-2.5 pb-1 flex justify-center">
          <span className="h-1 w-10 rounded-full bg-white/25" />
        </div>
        {/* Header */}
        <div className="bg-ink text-white px-4 sm:px-5 py-3.5 sm:py-4 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5">
          <div
            className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-white font-cairo font-bold text-base shadow-sm ${
              currentUser.role === 'owner'
                ? 'bg-brass'
                : currentUser.role === 'buyer'
                ? 'bg-done'
                : 'bg-ink-light'
            }`}
          >
            {currentUser.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold font-cairo text-[13.5px] sm:text-sm text-white truncate">
              الملف التعريفي والإعدادات
            </h3>
            <p className="text-[11px] text-ink-muted truncate">{currentUser.email}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="grid size-10 -mr-1.5 shrink-0 place-items-center rounded-full text-ink-muted hover:text-white hover:bg-white/10 active:scale-95 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="space-y-4 overflow-y-auto p-4 pb-4 sm:p-5">
          {errorMsg && (
            <div className="p-3 bg-late-soft border border-late-soft rounded-xl text-xs text-late flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {savedSuccess && (
            <div className="p-3 bg-done-soft border border-done-soft rounded-xl text-xs text-done flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>تم حفظ التعديلات بنجاح!</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">
              اسم المستخدم / المسؤول
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 h-11 sm:h-auto sm:py-2 text-base sm:text-xs rounded-xl border border-line bg-paper focus:bg-white focus:outline-none focus:border-brass focus:ring-2 focus:ring-brass/20 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">رقم الهاتف</label>
            <input
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 h-11 sm:h-auto sm:py-2 text-base sm:text-xs rounded-xl border border-line bg-paper focus:bg-white focus:outline-none focus:border-brass focus:ring-2 focus:ring-brass/20 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">
              البريد الإلكتروني (ثابت)
            </label>
            <input
              type="email"
              disabled
              value={currentUser.email}
              className="w-full px-3.5 h-11 sm:h-auto sm:py-2 text-base sm:text-xs rounded-xl border border-line-soft bg-paper-alt/50 text-copy-muted cursor-not-allowed dir-ltr text-right"
            />
          </div>

          <section className="rounded-[1.4rem] bg-ink/[0.05] p-1.5 ring-1 ring-line/60">
            <div className="rounded-[calc(1.4rem-0.375rem)] bg-paper-warm/70 p-3.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-2">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-brass/15 text-brass">
                    <HardDriveDownload className="size-4" strokeWidth={1.5} />
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-ink">النسخ الاحتياطي والبيانات</h4>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-copy-muted">
                      احفظ نسخة من سجلات الدفتر أو استرجع نسخة سابقة.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenBackup();
                  }}
                  className="h-10 shrink-0 rounded-xl bg-ink px-4 text-[12px] font-bold text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-ink-light active:scale-[0.97]"
                >
                  فتح
                </button>
              </div>
            </div>
          </section>

          <div className="pt-2 border-t border-paper-alt">
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="h-11 w-full px-3 rounded-xl border border-late-soft bg-late-soft hover:bg-late-soft text-[12.5px] font-bold text-late flex items-center justify-center gap-1.5 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
              <span className="truncate">تسجيل الخروج</span>
            </button>
          </div>

          {/* Footer Save — sticky on mobile */}
          <div className="sticky bottom-0 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 mt-2 border-t border-line/60 bg-white/95 backdrop-blur-sm px-4 sm:px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 sm:flex sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-4 text-[13px] font-bold text-copy-muted hover:text-ink rounded-xl hover:bg-paper transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="h-11 w-full sm:w-auto px-6 text-[13px] font-bold text-white bg-brass hover:bg-brass rounded-xl shadow-xs transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]"
            >
              حفظ التعديلات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
