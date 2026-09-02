import { createFileRoute, Link } from "@tanstack/react-router";
import "../talbat/app.css";
import brandMark from "../assets/brand-mark.png";
import heroImg from "../assets/landing-hero.jpg";
import ordersImg from "../assets/landing-orders.jpg";
import suppliersImg from "../assets/landing-suppliers.jpg";
import ctaImg from "../assets/landing-cta.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "مِقاس — دفتر طلبات محلات الملابس" },
      {
        name: "description",
        content:
          "مِقاس دفتر رقمي لمحلات الملابس: سجّل الطلب، تابع العربون والمتبقي، اضبط حسابات الموردين والمرتجعات، واطبع كشفك في ثانية.",
      },
      { property: "og:title", content: "مِقاس — دفتر طلبات محلات الملابس" },
      {
        property: "og:description",
        content:
          "دفتر المحل بالمقاس: طلبات، عرابين، موردون ومرتجعات في مكان واحد يعمل على كل أجهزتك.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Mark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <img
      src={brandMark}
      alt="شعار مِقاس"
      width={1024}
      height={1024}
      className={`${className} object-contain`}
    />
  );
}

function Landing() {
  return (
    <div dir="rtl" className="min-h-screen bg-paper text-charcoal font-cairo">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2.5">
            <Mark className="h-8 w-8" />
            <div className="leading-tight">
              <div className="text-lg font-extrabold tracking-tight text-ink">مِقاس</div>
              <div className="text-[11px] text-ink-light/70">دفتر المحل</div>
            </div>
          </div>
          <Link
            to="/app"
            className="rounded-lg bg-ink px-4 py-2 text-sm font-bold text-on-ink transition hover:bg-ink-deep"
          >
            ادخل الدفتر
          </Link>
        </div>
      </header>

      {/* Hero — image as canvas, text bottom-right */}
      <section className="relative">
        <div className="relative h-[78vh] min-h-[520px] w-full overflow-hidden">
          <img
            src={heroImg}
            alt="طاولة عمل في محل ملابس مع دفتر طلبات"
            width={1920}
            height={1080}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-ink-deep/85 via-ink-deep/55 to-ink-deep/10" />
          <div className="absolute inset-0">
            <div className="mx-auto flex h-full max-w-6xl items-end px-5 pb-14">
              <div className="max-w-xl">
                <span className="inline-block border-b-2 border-brass pb-1 text-xs font-bold tracking-[0.2em] text-brass-light">
                  دفتر محلات الملابس
                </span>
                <h1 className="mt-5 text-4xl font-black leading-[1.15] text-on-ink sm:text-6xl">
                  دفتر محلك،
                  <br />
                  بالمقاس.
                </h1>
                <p className="mt-5 max-w-md text-base leading-relaxed text-on-ink/80">
                  اكتب الطلب زي ما بتكتبه على الورق — واحصل على العربون والمتبقي
                  وحساب المورد محسوبين لك، على كل جهاز.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    to="/app"
                    className="rounded-lg bg-brass px-6 py-3 text-sm font-extrabold text-ink-deep transition hover:bg-brass-light"
                  >
                    ابدأ الآن مجانًا
                  </Link>
                  <a
                    href="#features"
                    className="border-b border-on-ink/40 pb-0.5 text-sm font-bold text-on-ink/85 transition hover:border-brass hover:text-brass-light"
                  >
                    شوف إزاي يشتغل ↙
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quiet proof strip */}
      <section className="border-b border-ink/10 bg-paper-warm">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-5 py-12 sm:grid-cols-4">
          {[
            ["الطلب", "في ٣٠ ثانية"],
            ["العربون والمتبقي", "محسوب تلقائيًا"],
            ["الكشوفات", "جاهزة للطباعة"],
            ["بياناتك", "على كل أجهزتك"],
          ].map(([a, b]) => (
            <div key={a} className="border-e border-ink/10 px-4 last:border-e-0">
              <div className="text-base font-extrabold text-ink">{a}</div>
              <div className="mt-1 text-sm text-ink-light/75">{b}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature 1 — editorial side image (image right) */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-24">
        <div className="grid items-center gap-12 md:grid-cols-[1fr_1.1fr]">
          <div>
            <span className="text-xs font-bold tracking-[0.2em] text-brass">٠١ — الطلبات</span>
            <h2 className="mt-4 text-3xl font-black leading-snug text-ink sm:text-4xl">
              كل طلب في سطر واحد واضح
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-ink-light/85">
              المقاس، اللون، البديل، عدد القطع، تاريخ الطلب، السعر والمتبقي —
              وكل ده قابل للفلترة والترتيب والبحث والطباعة.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-ink-light">
              {[
                "فلاتر بالمدى الزمني و«عليه متبقٍ»",
                "تحديد متعدد وإجراءات جماعية",
                "تراجع فوري بعد أي حذف",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-brass" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="overflow-hidden rounded-xl border border-ink/10 shadow-[0_24px_60px_-30px_rgba(20,28,45,0.5)]">
            <img
              src={ordersImg}
              alt="جدول الطلبات داخل تطبيق مِقاس"
              width={1400}
              height={1000}
              loading="lazy"
              className="w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Feature 2 — full-bleed background, text bottom-left */}
      <section className="relative">
        <div className="relative h-[62vh] min-h-[420px] overflow-hidden">
          <img
            src={suppliersImg}
            alt="كشف حساب مورد مطبوع"
            width={1600}
            height={900}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-deep/90 via-ink-deep/45 to-transparent" />
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto max-w-6xl px-5 pb-12">
              <span className="text-xs font-bold tracking-[0.2em] text-brass-light">
                ٠٢ — الموردون والمرتجعات
              </span>
              <h2 className="mt-3 max-w-lg text-3xl font-black leading-snug text-on-ink sm:text-4xl">
                حسابك مع كل مورد… بدون مراجعة آخر الشهر
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-on-ink/75">
                المرتجع يتخصم، المدفوع يتسجّل، والرصيد يظهر لحظيًا — واطبع الكشف
                للمورد بضغطة.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 3 — mini minimalist */}
      <section className="mx-auto max-w-3xl px-5 py-28 text-center">
        <span className="text-xs font-bold tracking-[0.2em] text-brass">٠٣ — على كل جهاز</span>
        <h2 className="mt-5 text-3xl font-black leading-snug text-ink sm:text-4xl">
          تكتب على الموبايل، تطبع من الكمبيوتر
        </h2>
        <p className="mx-auto mt-4 max-w-lg leading-relaxed text-ink-light/85">
          بياناتك محفوظة بحسابك، متزامنة تلقائيًا، ومحمية — من غير ملفات ولا نسخ
          ضائعة.
        </p>
      </section>

      {/* Closing CTA */}
      <section className="relative">
        <div className="relative min-h-[380px] overflow-hidden">
          <img
            src={ctaImg}
            alt="محل ملابس هادئ"
            width={1600}
            height={700}
            loading="lazy"
            className="h-[380px] w-full object-cover"
          />
          <div className="absolute inset-0 bg-ink-deep/85" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="px-5 text-center">
              <Mark className="mx-auto h-12 w-12" />
              <h2 className="mt-5 text-3xl font-black text-on-ink sm:text-4xl">
                خلّي دفترك بالمقاس
              </h2>
              <Link
                to="/app"
                className="mt-7 inline-block rounded-lg bg-brass px-8 py-3.5 text-sm font-extrabold text-ink-deep transition hover:bg-brass-light"
              >
                ابدأ الآن
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-ink/10 bg-paper">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-xs text-ink-light/70 sm:flex-row">
          <div className="flex items-center gap-2">
            <Mark className="h-5 w-5" />
            <span className="font-bold text-ink">مِقاس</span>
          </div>
          <span>دفتر طلبات محلات الملابس</span>
        </div>
      </footer>
    </div>
  );
}
