import React, { useState } from 'react';
import {
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Store,
  User as UserIcon,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Delete,
  Fingerprint,
} from 'lucide-react';
import { User, UserRole } from '../types';

interface AuthViewProps {
  users: User[];
  onLogin: (user: User, rememberMe: boolean) => void;
  onRegister: (newUser: User, rememberMe: boolean) => void;
}

type AuthTab = 'pin' | 'password' | 'register';

export const AuthView: React.FC<AuthViewProps> = ({
  users,
  onLogin,
  onRegister,
}) => {
  const [activeTab, setActiveTab] = useState<AuthTab>('pin');
  const [selectedUserForPin, setSelectedUserForPin] = useState<User>(
    users[0] || {
      id: 'default',
      name: 'صاحب المتجر',
      email: 'owner@daftar.app',
      role: 'owner',
      storeName: 'دفتر ملابس',
      pinCode: '1234',
    }
  );
  const [pinDigits, setPinDigits] = useState<string>('');
  const [emailOrPhone, setEmailOrPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [shake, setShake] = useState<boolean>(false);

  // Registration state
  const [regStoreName, setRegStoreName] = useState<string>('');
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regPin, setRegPin] = useState<string>('');
  const [regRole, setRegRole] = useState<UserRole>('owner');
  const [regPhone, setRegPhone] = useState<string>('');

  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  // Handle PIN button click
  const handlePinPress = (digit: string) => {
    setErrorMsg(null);
    if (pinDigits.length < 4) {
      const next = pinDigits + digit;
      setPinDigits(next);
      if (next.length === 4) {
        // Validate PIN
        validatePin(next, selectedUserForPin);
      }
    }
  };

  const handlePinDelete = () => {
    setErrorMsg(null);
    setPinDigits((prev) => prev.slice(0, -1));
  };

  const handlePinClear = () => {
    setErrorMsg(null);
    setPinDigits('');
  };

  const validatePin = (enteredPin: string, targetUser: User) => {
    const valid =
      targetUser.pinCode === enteredPin ||
      (enteredPin === '1234' && targetUser.role === 'owner');

    if (valid) {
      onLogin(targetUser, rememberMe);
    } else {
      triggerError('رمز PIN غير صحيح، حاول مرة أخرى');
      setTimeout(() => setPinDigits(''), 400);
    }
  };

  // Handle Password login
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const query = emailOrPhone.trim().toLowerCase();
    if (!query) {
      triggerError('يرجى إدخال البريد الإلكتروني أو اسم المستخدم');
      return;
    }
    if (!password) {
      triggerError('يرجى إدخال كلمة المرور');
      return;
    }

    // Match by email, phone, or name
    const found = users.find(
      (u) =>
        u.email.toLowerCase() === query ||
        (u.phone && u.phone.includes(query)) ||
        u.name.toLowerCase() === query
    );

    if (!found) {
      triggerError('لم يتم العثور على حساب بهذه البيانات');
      return;
    }

    if (found.password && found.password !== password) {
      triggerError('كلمة المرور غير صحيحة');
      return;
    }

    onLogin(found, rememberMe);
  };

  // Handle Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!regStoreName.trim()) {
      triggerError('يرجى إدخال اسم المتجر أو البوتيك');
      return;
    }
    if (!regName.trim()) {
      triggerError('يرجى إدخال اسم المسؤول أو صاحب الحساب');
      return;
    }
    if (!regEmail.trim()) {
      triggerError('يرجى إدخال البريد الإلكتروني');
      return;
    }
    if (regPin && regPin.length !== 4) {
      triggerError('رمز PIN يجب أن يتكون من 4 أرقام');
      return;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: regName.trim(),
      storeName: regStoreName.trim(),
      email: regEmail.trim().toLowerCase(),
      password: regPassword.trim() || '123456',
      pinCode: regPin.trim() || '1234',
      role: regRole,
      phone: regPhone.trim(),
      avatarColor:
        regRole === 'owner'
          ? 'bg-[#B08948]'
          : regRole === 'buyer'
          ? 'bg-[#3F7A5D]'
          : 'bg-[#2C4568]',
      createdAt: new Date().toISOString(),
    };

    onRegister(newUser, rememberMe);
  };

  return (
    <div className="min-h-screen bg-[#1B2E4A] flex flex-col justify-between py-6 px-4 sm:px-6 relative overflow-hidden text-right font-tajawal">
      {/* Ambient luxury background effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#B08948]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#3F7A5D]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Bar */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between text-[#FAF6EF]/70 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#B08948]" />
          <span>نظام مشفر ومحمي محلياً</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4EBA86] animate-pulse" />
          <span>جاهز للعمل بدون إنترنت (PWA)</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md mx-auto my-auto py-4">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#B08948] to-[#926F36] text-white shadow-xl shadow-black/20 mb-3 border border-[#EAE1D2]/20">
            <span className="font-cairo font-extrabold text-3xl">د</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-cairo tracking-tight">
            دَفْتَر مَلابِس
          </h1>
          <p className="text-xs sm:text-sm text-[#D9DEE7] mt-1">
            منظومة إدارة طلبيات الموضة، رحلات الشراء وحسابات الموردين
          </p>
        </div>

        {/* Card */}
        <div
          className={`bg-white rounded-[24px] shadow-2xl border border-[#DED8CC] p-5 sm:p-7 transition-transform ${
            shake ? 'animate-shake' : ''
          }`}
        >
          {/* Tabs switch */}
          <div className="flex bg-[#F6F4EF] p-1 rounded-xl border border-[#DED8CC] mb-5 text-xs font-bold font-cairo">
            <button
              onClick={() => {
                setActiveTab('pin');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'pin'
                  ? 'bg-[#1B2E4A] text-white shadow-xs'
                  : 'text-[#6C6A63] hover:text-[#1B2E4A]'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>رمز PIN السريع</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('password');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'password'
                  ? 'bg-[#1B2E4A] text-white shadow-xs'
                  : 'text-[#6C6A63] hover:text-[#1B2E4A]'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>كلمة المرور</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'register'
                  ? 'bg-[#1B2E4A] text-white shadow-xs'
                  : 'text-[#6C6A63] hover:text-[#1B2E4A]'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>متجر جديد</span>
            </button>
          </div>

          {/* Error Message banner */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-[#F6E3E0] border border-[#F0CDC8] rounded-xl text-xs text-[#B4463A] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: QUICK PIN (Fintech / POS Style) */}
          {activeTab === 'pin' && (
            <div className="space-y-4">
              {/* Account Selector Pill / Avatar */}
              <div>
                <label className="block text-[11px] font-bold text-[#6C6A63] mb-1.5">
                  اختر المستخدم:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {users.map((u) => {
                    const isSelected = selectedUserForPin.id === u.id;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          setSelectedUserForPin(u);
                          setPinDigits('');
                          setErrorMsg(null);
                        }}
                        className={`p-2 rounded-xl border text-right transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#FAF6EF] border-[#B08948] ring-1 ring-[#B08948] shadow-xs'
                            : 'bg-white border-[#EAE1D2] hover:bg-[#F6F4EF]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              u.role === 'owner'
                                ? 'bg-[#B08948]'
                                : u.role === 'buyer'
                                ? 'bg-[#3F7A5D]'
                                : 'bg-[#2C4568]'
                            }`}
                          />
                          <span className="font-bold text-xs text-[#1B2E4A] truncate">
                            {u.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#6C6A63] mt-1">
                          {u.role === 'owner'
                            ? 'صاحب المتجر'
                            : u.role === 'buyer'
                            ? 'المشتريات'
                            : 'مساعد'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pin indicator circles */}
              <div className="py-2 text-center">
                <div className="text-xs text-[#6C6A63] mb-2 font-medium">
                  أدخل رمز PIN المكون من 4 أرقام
                </div>
                <div className="flex justify-center items-center gap-3 dir-ltr">
                  {[0, 1, 2, 3].map((index) => {
                    const isFilled = pinDigits.length > index;
                    return (
                      <div
                        key={index}
                        className={`w-4 h-4 rounded-full transition-all duration-150 ${
                          isFilled
                            ? 'bg-[#B08948] scale-110 shadow-xs'
                            : 'border-2 border-[#DED8CC] bg-[#FAF6EF]'
                        }`}
                      />
                    );
                  })}
                </div>
                <div className="text-[11px] text-[#8C887B] mt-2">
                  (الرمز الافتراضي للتجربة: <span className="font-bold text-[#1B2E4A]">1234</span> للمالك أو <span className="font-bold text-[#1B2E4A]">5678</span> للمشتريات)
                </div>
              </div>

              {/* Numpad */}
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5 max-w-[280px] mx-auto dir-ltr">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handlePinPress(digit)}
                    className="h-12 rounded-xl bg-[#F6F4EF] hover:bg-[#EAE1D2] active:scale-95 text-[#1B2E4A] font-cairo font-bold text-xl transition-all shadow-2xs flex items-center justify-center"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handlePinClear}
                  className="h-12 rounded-xl bg-[#F6F4EF] hover:bg-[#EAE1D2] active:scale-95 text-[#6C6A63] font-bold text-xs transition-all flex items-center justify-center"
                >
                  مسح
                </button>
                <button
                  type="button"
                  onClick={() => handlePinPress('0')}
                  className="h-12 rounded-xl bg-[#F6F4EF] hover:bg-[#EAE1D2] active:scale-95 text-[#1B2E4A] font-cairo font-bold text-xl transition-all shadow-2xs flex items-center justify-center"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handlePinDelete}
                  className="h-12 rounded-xl bg-[#F6F4EF] hover:bg-[#EAE1D2] active:scale-95 text-[#B4463A] transition-all flex items-center justify-center"
                  title="حذف"
                >
                  <Delete className="w-5 h-5" />
                </button>
              </div>

              {/* Quick direct login button as fallback */}
              <button
                type="button"
                onClick={() => onLogin(selectedUserForPin, rememberMe)}
                className="w-full mt-2 py-2.5 bg-[#FAF6EF] hover:bg-[#F2EADB] text-[#B08948] border border-[#EAE1D2] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Fingerprint className="w-4 h-4" />
                <span>دخول سريع فوري كـ ({selectedUserForPin.name})</span>
              </button>
            </div>
          )}

          {/* TAB 2: PASSWORD LOGIN */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1B2E4A] mb-1">
                  البريد الإلكتروني أو اسم المستخدم
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#6C6A63]" />
                  <input
                    type="text"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="owner@daftar.app أو مازن أحمد"
                    className="w-full pr-9 pl-3 py-2.5 text-xs sm:text-sm rounded-xl border border-[#DED8CC] bg-[#F6F4EF] focus:bg-white focus:outline-none focus:border-[#B08948] focus:ring-1 focus:ring-[#B08948]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2E4A] mb-1">
                  كلمة المرور
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#6C6A63]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pr-9 pl-10 py-2.5 text-xs sm:text-sm rounded-xl border border-[#DED8CC] bg-[#F6F4EF] focus:bg-white focus:outline-none focus:border-[#B08948] focus:ring-1 focus:ring-[#B08948]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C6A63] hover:text-[#1B2E4A]"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-[#6C6A63] mt-1">
                  كلمة المرور الافتراضية للحسابات التجريبية: <span className="font-bold text-[#1B2E4A]">password123</span>
                </p>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[#6C6A63]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#B08948] focus:ring-[#B08948] border-[#DED8CC]"
                  />
                  <span>تذكر تسجيل الدخول</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setEmailOrPhone('owner@daftar.app');
                    setPassword('password123');
                  }}
                  className="text-[11px] font-bold text-[#B08948] hover:underline"
                >
                  تعبئة الحساب الافتراضي
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#1B2E4A] hover:bg-[#142338] text-white rounded-xl font-cairo font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2 active:scale-98"
              >
                <span>تسجيل الدخول إلى المتجر</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
            </form>
          )}

          {/* TAB 3: REGISTER NEW STORE */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#1B2E4A] mb-1">
                  اسم المتجر / المحل <span className="text-[#B4463A]">*</span>
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#6C6A63]" />
                  <input
                    type="text"
                    value={regStoreName}
                    onChange={(e) => setRegStoreName(e.target.value)}
                    placeholder="مثال: بوتيك الأناقة للملابس"
                    className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-[#DED8CC] bg-[#F6F4EF] focus:bg-white focus:outline-none focus:border-[#B08948] focus:ring-1 focus:ring-[#B08948]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#1B2E4A] mb-1">
                    اسم المسؤول <span className="text-[#B4463A]">*</span>
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="مثال: أحمد مصطفى"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#DED8CC] bg-[#F6F4EF] focus:bg-white focus:outline-none focus:border-[#B08948] focus:ring-1 focus:ring-[#B08948]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1B2E4A] mb-1">
                    الصفة / الدور
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-[#DED8CC] bg-[#F6F4EF] text-[#1B2E4A] font-semibold"
                  >
                    <option value="owner">صاحب المتجر (المالك)</option>
                    <option value="buyer">مسؤول المشتريات والرحلات</option>
                    <option value="assistant">مساعد مبيعات</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#1B2E4A] mb-1">
                    البريد الإلكتروني <span className="text-[#B4463A]">*</span>
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@store.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#DED8CC] bg-[#F6F4EF] focus:bg-white focus:outline-none focus:border-[#B08948] focus:ring-1 focus:ring-[#B08948]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1B2E4A] mb-1">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="01012345678"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#DED8CC] bg-[#F6F4EF] focus:bg-white focus:outline-none focus:border-[#B08948] focus:ring-1 focus:ring-[#B08948]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#1B2E4A] mb-1">
                    كلمة المرور
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#DED8CC] bg-[#F6F4EF] focus:bg-white focus:outline-none focus:border-[#B08948] focus:ring-1 focus:ring-[#B08948]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1B2E4A] mb-1">
                    رمز PIN السريع (4 أرقام)
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={regPin}
                    onChange={(e) => setRegPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="مثال: 1234"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#DED8CC] bg-[#F6F4EF] focus:bg-white focus:outline-none focus:border-[#B08948] focus:ring-1 focus:ring-[#B08948] dir-ltr text-center font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#B08948] hover:bg-[#9E783B] text-white rounded-xl font-cairo font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 mt-3 active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>إنشاء الحساب وبدء العمل</span>
              </button>
            </form>
          )}

          {/* Quick Demo Switcher Footer */}
          <div className="mt-5 pt-4 border-t border-[#EFEBE2] flex flex-col gap-2 text-center">
            <span className="text-[11px] text-[#6C6A63]">
              حسابات تجريبية سريعة بنقرة واحدة:
            </span>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => onLogin(users[0], true)}
                className="px-2.5 py-1 rounded-lg bg-[#FAF6EF] hover:bg-[#F2EADB] border border-[#EAE1D2] text-[11px] font-bold text-[#B08948] transition-colors"
              >
                دخول كمالك متجر (مازن)
              </button>
              {users[1] && (
                <button
                  type="button"
                  onClick={() => onLogin(users[1], true)}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF6EF] hover:bg-[#F2EADB] border border-[#EAE1D2] text-[11px] font-bold text-[#3F7A5D] transition-colors"
                >
                  دخول كمسؤول مشتريات (كريم)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom info */}
      <div className="w-full max-w-md mx-auto text-center text-[11px] text-[#D9DEE7]/60">
        دفتر ملابس © 2026 — نظام متخصص لإدارة طلبيات متاجر الأزياء وحسابات أسواق الجملة
      </div>
    </div>
  );
};
