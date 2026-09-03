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
      <div className="flex max-h-[94dvh] w-full max-w-md flex-col overflow-hidden rounded-t-[22px] border border-line bg-white text-right shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-[22px]">
        {/* Header */}
        <div className="bg-ink text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-cairo font-bold text-base shadow-sm ${
                currentUser.role === 'owner'
                  ? 'bg-brass'
                  : currentUser.role === 'buyer'
                  ? 'bg-done'
                  : 'bg-ink-light'
              }`}
            >
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold font-cairo text-sm text-white">
                الملف التعريفي وحساب المتجر
              </h3>
              <p className="text-[11px] text-ink-muted">
                {currentUser.storeName}
              </p>
            </div>
          </div>

          <button type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-ink-muted hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="space-y-4 overflow-y-auto p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-5">
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
            <label className="block text-xs font-bold text-ink mb-1">
              اسم المستخدم / المسؤول
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-line bg-paper focus:bg-white focus:outline-none focus:border-brass focus:ring-1 focus:ring-brass"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink mb-1">
              اسم المتجر / البوتيك
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-line bg-paper focus:bg-white focus:outline-none focus:border-brass focus:ring-1 focus:ring-brass"
            />
          </div>

          {/* هوية المتجر */}
          <div className="rounded-2xl border border-line bg-paper-warm/60 p-3 space-y-3">
            <div className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-brass" />
              <span className="text-xs font-bold text-ink">هوية المتجر</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-copy-muted">
                  صورة العلامة
                </label>
                <label className="flex h-20 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-white/70 text-[11px] text-copy-muted hover:border-brass">
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
                <label className="flex h-20 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-white/70 text-[11px] text-copy-muted hover:border-brass">
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
            <p className="text-[10px] text-copy-muted">
              يظهر الشعار في زاوية الشريط العلوي، وتظهر صورة العلامة في ملف المتجر.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                رقم الهاتف
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-line bg-paper focus:bg-white focus:outline-none focus:border-brass focus:ring-1 focus:ring-brass"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                رمز PIN السريع (4 أرقام)
              </label>
              <input
                type="text"
                maxLength={4}
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-line bg-paper focus:bg-white focus:outline-none focus:border-brass focus:ring-1 focus:ring-brass text-center font-bold dir-ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink mb-1">
              البريد الإلكتروني (ثابت)
            </label>
            <input
              type="email"
              disabled
              value={currentUser.email}
              className="w-full px-3 py-2 text-xs rounded-xl border border-line-soft bg-paper-alt/50 text-copy-muted cursor-not-allowed dir-ltr text-right"
            />
          </div>

          <section className="rounded-2xl border border-line bg-paper-warm/60 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-2">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-brass/15 text-brass">
                  <HardDriveDownload className="size-4" />
                </span>
                <div>
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
                className="shrink-0 rounded-xl bg-ink px-3 py-2 text-[11px] font-bold text-white transition-colors hover:bg-ink-light"
              >
                فتح
              </button>
            </div>
          </section>

          {/* Quick lock & logout buttons */}
          <div className="pt-2 border-t border-paper-alt flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onLockScreen();
              }}
              className="px-3 py-2 rounded-xl border border-line bg-paper-warm hover:bg-paper-alt text-xs font-bold text-ink flex items-center gap-1.5 transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-brass" />
              <span>قفل الشاشة مؤقتاً</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="px-3 py-2 rounded-xl border border-late-soft bg-late-soft hover:bg-late-soft text-xs font-bold text-late flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>

          {/* Footer Save */}
          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-copy-muted hover:text-ink rounded-xl hover:bg-paper"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-brass hover:bg-brass rounded-xl shadow-xs transition-colors"
            >
              حفظ التعديلات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
