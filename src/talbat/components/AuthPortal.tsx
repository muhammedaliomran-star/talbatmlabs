import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Store, User as UserIcon, Phone, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import atelier from '@/assets/auth-atelier.jpg';
import { UserRole } from '../types';

type Mode = 'login' | 'register' | 'forgot';

const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'owner', label: 'صاحب المتجر' },
  { value: 'buyer', label: 'مسؤول المشتريات' },
  { value: 'assistant', label: 'مساعد المبيعات' },
];

export const AuthPortal: React.FC = () => {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('owner');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const translate = (msg: string) => {
    const m = msg.toLowerCase();
    if (m.includes('invalid login')) return 'البريد الإلكتروني أو كلمة السر غير صحيحة';
    if (m.includes('already registered') || m.includes('already been registered')) return 'هذا البريد مسجّل بالفعل، سجّل الدخول مباشرة';
    if (m.includes('password') && m.includes('6')) return 'كلمة السر يجب أن تكون 6 أحرف على الأقل';
    if (m.includes('pwned') || m.includes('compromised')) return 'كلمة السر ضعيفة ومسربة، اختر كلمة أقوى';
    if (m.includes('email') && m.includes('valid')) return 'صيغة البريد الإلكتروني غير صحيحة';
    return msg;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (mode === 'forgot') {
      if (!email.trim()) return setError('اكتب بريدك الإلكتروني أولاً');
      setLoading(true);
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setLoading(false);
      if (err) return setError(translate(err.message));
      return setNotice('تم إرسال رابط إعادة تعيين كلمة السر إلى بريدك');
    }

    if (!email.trim() || !password) return setError('البريد وكلمة السر مطلوبان');

    setLoading(true);
    if (mode === 'login') {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      setLoading(false);
      if (err) setError(translate(err.message));
      return;
    }

    if (!name.trim() || !storeName.trim()) {
      setLoading(false);
      return setError('اسمك واسم المتجر مطلوبان');
    }

    const { error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          name: name.trim(),
          store_name: storeName.trim(),
          phone: phone.trim(),
          role,
        },
      },
    });
    setLoading(false);
    if (err) setError(translate(err.message));
  };

  const googleSignIn = async () => {
    setError(null);
    try {
      await lovable.auth.signInWithOAuth('google', { redirect_uri: window.location.origin });
    } catch (err) {
      setError('تعذّر الدخول بحساب جوجل، حاول مرة أخرى');
    }
  };

  const field =
    'w-full bg-canvas border border-line rounded-xl py-3 pr-11 pl-4 text-[15px] text-charcoal placeholder:text-placeholder outline-none focus:border-brass focus:ring-2 focus:ring-brass/15 transition';

  return (
    <div className="min-h-screen bg-paper text-charcoal flex flex-col lg:flex-row-reverse">
      {/* Image canvas */}
      <div className="relative lg:w-[46%] h-56 sm:h-72 lg:h-auto overflow-hidden">
        <img
          src={atelier}
          alt="أتيليه ملابس بإضاءة دافئة ودفتر جلدي على منضدة خشبية"
          width={1280}
          height={1600}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-deep/85 via-ink-deep/30 to-transparent" />
        <div className="absolute bottom-0 right-0 p-8 lg:p-12 max-w-lg">
          <span className="inline-block text-[11px] tracking-[0.22em] text-brass-light mb-4">
            دفتر ملابس
          </span>
          <h2 className="text-white text-2xl lg:text-[38px] leading-[1.25] font-semibold">
            كل طلبية، كل عميل، وكل مورد — في دفتر واحد.
          </h2>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-16">
        <div className="w-full max-w-md">
          <div className="mb-9">
            <div className="w-11 h-11 rounded-xl bg-brass flex items-center justify-center mb-6">
              <Store className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-[30px] leading-tight font-semibold tracking-tight">
              {mode === 'login' && 'أهلاً بعودتك'}
              {mode === 'register' && 'ابدأ دفترك'}
              {mode === 'forgot' && 'استعادة كلمة السر'}
            </h1>
            <p className="text-copy-muted text-[15px] mt-2">
              {mode === 'login' && 'سجّل الدخول لمتابعة طلبيات متجرك.'}
              {mode === 'register' && 'أنشئ حسابك في أقل من دقيقة.'}
              {mode === 'forgot' && 'هنبعتلك رابط لتعيين كلمة سر جديدة.'}
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2 rounded-xl bg-late-soft border border-late-soft px-4 py-3 text-late text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {notice && (
            <div className="mb-5 flex items-start gap-2 rounded-xl bg-done-soft border border-done-soft px-4 py-3 text-done text-sm">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{notice}</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-placeholder absolute top-1/2 -translate-y-1/2 right-4" />
                  <input className={field} placeholder="اسمك" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="relative">
                  <Store className="w-4 h-4 text-placeholder absolute top-1/2 -translate-y-1/2 right-4" />
                  <input className={field} placeholder="اسم المتجر" value={storeName} maxLength={80} onChange={(e) => setStoreName(e.target.value)} />
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-placeholder absolute top-1/2 -translate-y-1/2 right-4" />
                  <input className={field} placeholder="رقم الهاتف (اختياري)" value={phone} maxLength={20} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {roleOptions.map((r) => (
                    <button
                      type="button"
                      key={r.value}
                      onClick={() => setRole(r.value)}
                      className={`rounded-xl border px-2 py-2.5 text-[13px] transition ${
                        role === r.value
                          ? 'border-pending bg-pending-soft text-pending font-medium'
                          : 'border-line bg-canvas text-copy-muted hover:border-line'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="w-4 h-4 text-placeholder absolute top-1/2 -translate-y-1/2 right-4" />
              <input
                type="email"
                autoComplete="email"
                className={field}
                placeholder="البريد الإلكتروني"
                value={email}
                maxLength={255}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {mode !== 'forgot' && (
              <div className="relative">
                <Lock className="w-4 h-4 text-placeholder absolute top-1/2 -translate-y-1/2 right-4" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className={`${field} pl-12`}
                  placeholder="كلمة السر"
                  value={password}
                  maxLength={72}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute top-1/2 -translate-y-1/2 left-4 text-placeholder hover:text-copy-muted"
                  aria-label="إظهار كلمة السر"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-ink-deep text-on-ink py-3.5 text-[15px] font-medium hover:bg-ink transition disabled:opacity-60"
            >
              {loading
                ? 'جارٍ التنفيذ…'
                : mode === 'login'
                ? 'تسجيل الدخول'
                : mode === 'register'
                ? 'إنشاء الحساب'
                : 'إرسال الرابط'}
            </button>
          </form>

          {mode !== 'forgot' && (
            <>
              <div className="flex items-center gap-3 my-6">
                <span className="h-px flex-1 bg-line" />
                <span className="text-xs text-placeholder">أو</span>
                <span className="h-px flex-1 bg-line" />
              </div>
              <button
                type="button"
                onClick={googleSignIn}
                className="w-full rounded-xl border border-line bg-canvas py-3.5 text-[15px] font-medium hover:border-line transition flex items-center justify-center gap-2.5"
              >
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" aria-hidden="true">
                  <path fill="var(--google-blue)" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9z" />
                  <path fill="var(--google-green)" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z" />
                  <path fill="var(--google-yellow)" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1z" />
                  <path fill="var(--google-red)" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9z" />
                </svg>
                المتابعة بحساب جوجل
              </button>
            </>
          )}

          <div className="mt-8 text-sm text-copy-muted space-y-2">
            {mode === 'login' && (
              <>
                <p>
                  ليس لديك حساب؟{' '}
                  <button type="button" className="text-brass font-medium hover:underline" onClick={() => { setMode('register'); setError(null); }}>
                    أنشئ حسابك
                  </button>
                </p>
                <button type="button" className="text-copy-muted hover:text-charcoal hover:underline" onClick={() => { setMode('forgot'); setError(null); }}>
                  نسيت كلمة السر؟
                </button>
              </>
            )}
            {mode !== 'login' && (
              <button type="button"
                className="inline-flex items-center gap-1.5 text-brass font-medium hover:underline"
                onClick={() => { setMode('login'); setError(null); setNotice(null); }}
              >
                <ArrowLeft className="w-4 h-4" />
                العودة لتسجيل الدخول
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
