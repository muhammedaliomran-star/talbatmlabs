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
} from 'lucide-react';
import { User, UserRole } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
  onLockScreen: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onLogout,
  onLockScreen,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [storeName, setStoreName] = useState(currentUser.storeName);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [pinCode, setPinCode] = useState(currentUser.pinCode || '');
  const [password, setPassword] = useState(currentUser.password || '');
  const [role, setRole] = useState<UserRole>(currentUser.role);
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
    };

    onUpdateUser(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-tajawal animate-in fade-in duration-200">
      <div className="bg-white rounded-[22px] border border-line shadow-2xl w-full max-w-md overflow-hidden text-right">
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

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-ink-muted hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
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
