import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import "../talbat/app.css";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "تعيين كلمة سر جديدة - دفتر ملابس" },
      { name: "description", content: "صفحة تعيين كلمة سر جديدة لحسابك في تطبيق دفتر ملابس لإدارة الطلبيات والموردين." },
      { property: "og:title", content: "تعيين كلمة سر جديدة - دفتر ملابس" },
      { property: "og:description", content: "أعد تعيين كلمة سر حسابك في دفتر ملابس بأمان." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ClientOnly>
      <ResetPassword />
    </ClientOnly>
  ),
});

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("كلمة السر يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) setError(err.message);
    else setStatus("تم تحديث كلمة السر بنجاح، يمكنك الآن استخدام التطبيق.");
  };

  return (
    <div className="min-h-screen bg-[#F6F4EF] text-[#24262B] flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-6">تعيين كلمة سر جديدة</h1>
        {error && <p className="mb-4 text-sm text-[#B4463A]">{error}</p>}
        {status && <p className="mb-4 text-sm text-[#3F7A5D]">{status}</p>}
        <input
          type="password"
          value={password}
          maxLength={72}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="كلمة السر الجديدة"
          className="w-full bg-white border border-[#DED8CC] rounded-xl py-3 px-4 outline-none focus:border-[#B08948] mb-4"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#24262B] text-white py-3.5 font-medium disabled:opacity-60"
        >
          {loading ? "جارٍ الحفظ…" : "حفظ كلمة السر"}
        </button>
        <a href="/" className="block text-center mt-6 text-sm text-[#B08948] hover:underline">
          العودة للتطبيق
        </a>
      </form>
    </div>
  );
}
