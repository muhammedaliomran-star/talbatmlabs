import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  Store,
  KeyRound,
  Mail,
  Phone,
  Shield,
  LogOut,
  Lock,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  HardDriveDownload,
} from 'lucide-react';
import { User, UserRole } from '../types';
import { uploadBrandingImage, resolveBrandingUrl } from '../lib/branding';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
  onLockScreen: () => void;
  onOpenBackup: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onLogout,
  onLockScreen,
  onOpenBackup,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [storeName, setStoreName] = useState(currentUser.storeName);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [pinCode, setPinCode] = useState(currentUser.pinCode || '');
  const [password, setPassword] = useState(currentUser.password || '');
  const [role, setRole] = useState<UserRole>(currentUser.role);
  const [brandImagePath, setBrandImagePath] = useState(currentUser.brandImagePath || '');
  const [logoPath, setLogoPath] = useState(currentUser.logoPath || '');
  const [brandPreview, setBrandPreview] = useState(currentUser.brandImageUrl || '');
  const [logoPreview, setLogoPreview] = useState(currentUser.logoUrl || '');
  const [uploading, setUploading] = useState<'brand' | 'logo' | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpload = async (kind: 'brand' | 'logo', file?: File | null) => {
    if (!file) return;
    setErrorMsg(null);
    setUploading(kind);
    try {
      const path = await uploadBrandingImage(currentUser.id, kind, file);
      const url = (await resolveBrandingUrl(path)) || '';
      if (kind === 'brand') {
        setBrandImagePath(path);
        setBrandPreview(url);
      } else {
        setLogoPath(path);
        setLogoPreview(url);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('تعذر رفع الصورة، حاول مرة أخرى');
    } finally {
      setUploading(null);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('اسم المستخدم مطلوب');
      return;
    }
    if (!storeName.trim()) {
      setErrorMsg('اسم المتجر مطلوب');
      return;
    }
    if (pinCode && pinCode.length !== 4) {
      setErrorMsg('رمز PIN يجب أن يتكون من 4 أرقام');
      return;
    }

    const updated: User = {
      ...currentUser,
      name: name.trim(),
      storeName: storeName.trim(),
      phone: phone.trim(),
      pinCode: pinCode.trim(),
      password: password.trim() || currentUser.password,
      role,
      brandImagePath: brandImagePath || undefined,
      logoPath: logoPath || undefined,
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
              الملف التعريفي وحساب المتجر
            </h3>
            <p className="text-[11px] text-ink-muted truncate">
              {currentUser.storeName}
            </p>
          </div>

          <button type="button"
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
            <label className="block text-xs font-bold text-ink mb-1.5">
              اسم المتجر / البوتيك
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-3.5 h-11 sm:h-auto sm:py-2 text-base sm:text-xs rounded-xl border border-line bg-paper focus:bg-white focus:outline-none focus:border-brass focus:ring-2 focus:ring-brass/20 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
            />
          </div>


          {/* هوية المتجر */}
          <div className="rounded-[1.4rem] bg-ink/[0.05] p-1.5 ring-1 ring-line/60">
            <div className="rounded-[calc(1.4rem-0.375rem)] bg-paper-warm/70 p-3.5 space-y-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
            <div className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-brass" strokeWidth={1.5} />
              <span className="text-xs font-bold text-ink">هوية المتجر</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-copy-muted">
                  صورة العلامة
                </label>
                <label className="flex aspect-[4/3] cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-white/70 text-[11px] text-copy-muted transition-colors duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-brass active:scale-[0.98]">
                  {brandPreview ? (
                    <img src={brandPreview} alt="صورة العلامة" className="h-full w-full object-cover" />
                  ) : (
                    <span>{uploading === 'brand' ? 'جارٍ الرفع…' : 'اختر صورة'}</span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => void handleUpload('brand', e.target.files?.[0])}
                  />
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-copy-muted">
                  شعار صغير (الزاوية)
                </label>
                <label className="flex aspect-[4/3] cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-white/70 text-[11px] text-copy-muted transition-colors duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-brass active:scale-[0.98]">
                  {logoPreview ? (
                    <img src={logoPreview} alt="شعار المتجر" className="h-14 w-14 rounded-full object-cover" />
                  ) : (
                    <span>{uploading === 'logo' ? 'جارٍ الرفع…' : 'اختر شعار'}</span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => void handleUpload('logo', e.target.files?.[0])}
                  />
                </label>
              </div>
            </div>
            <p className="text-[10.5px] leading-5 text-copy-muted">
              يظهر الشعار في زاوية الشريط العلوي، وتظهر صورة العلامة في ملف المتجر.
            </p>
            </div>
          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2">
            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">
                رقم الهاتف
              </label>
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
                رمز PIN السريع (4 أرقام)
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3.5 h-11 sm:h-auto sm:py-2 text-base sm:text-xs rounded-xl border border-line bg-paper focus:bg-white focus:outline-none focus:border-brass focus:ring-2 focus:ring-brass/20 text-center font-bold tracking-[0.4em] dir-ltr transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
              />
            </div>
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

          {/* Quick lock & logout buttons */}
          <div className="pt-2 border-t border-paper-alt grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onLockScreen();
              }}
              className="h-11 px-3 rounded-xl border border-line bg-paper-warm hover:bg-paper-alt text-[12px] font-bold text-ink flex items-center justify-center gap-1.5 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]"
            >
              <Lock className="w-3.5 h-3.5 shrink-0 text-brass" strokeWidth={1.5} />
              <span className="truncate">قفل الشاشة مؤقتاً</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="h-11 px-3 rounded-xl border border-late-soft bg-late-soft hover:bg-late-soft text-[12px] font-bold text-late flex items-center justify-center gap-1.5 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]"
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
