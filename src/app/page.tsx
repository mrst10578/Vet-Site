import Link from "next/link";
import {
  ArrowLeft, ArrowUpLeft, BellRing, CalendarCheck2, Check, ClipboardPlus,
  HeartPulse, LockKeyhole, PawPrint, ShieldCheck, Stethoscope, Syringe,
} from "lucide-react";

const features = [
  { icon: HeartPulse, title: "پرونده سلامت یکپارچه", description: "سوابق ویزیت، حساسیت‌ها، داروها و مدارک هر حیوان در پرونده‌ای منظم و قابل پیگیری." },
  { icon: BellRing, title: "یادآورهای مراقبتی", description: "برنامه واکسن و داروها با وضعیت سررسید و امکان ثبت انجام مراقبت." },
  { icon: Stethoscope, title: "ارتباط با دامپزشک", description: "ویزیت، برنامه درمانی و سوابق ثبت‌شده توسط کلینیک در یک مسیر هماهنگ." },
  { icon: ShieldCheck, title: "اشتراک امن پرونده", description: "دسترسی هر فرد تنها به اطلاعات مجاز، با امکان کنترل و لغو دسترسی." },
];

export default function Home() {
  return (
    <main id="main-content">
      <header className="border-b border-emerald-100/80 bg-white/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2 text-xl font-extrabold text-emerald-900" aria-label="پت‌یار، صفحه اصلی">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-emerald-700 text-white"><PawPrint className="size-5" /></span>
            پت‌یار
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex" aria-label="ناوبری اصلی">
            <Link href="#features" className="hover:text-emerald-700">امکانات</Link>
            <Link href="#workflow" className="hover:text-emerald-700">نحوه کار</Link>
            <Link href="/clinic" className="hover:text-emerald-700">ویژه کلینیک‌ها</Link>
          </nav>
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800">
            ورود به پیش‌نمایش <ArrowLeft className="size-4" />
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/80 via-white to-background">
        <div className="pointer-events-none absolute -left-36 top-10 size-[400px] rounded-full bg-teal-100/55 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:py-24">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold text-emerald-800">
              <span className="size-2 rounded-full bg-emerald-500" /> شروع یک مراقبت هوشمندانه‌تر
            </span>
            <h1 className="mt-7 text-4xl font-black leading-[1.6] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem]">
              تمام دنیای سلامت پت، <span className="text-emerald-700">در یک جای امن.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-9 text-slate-600 sm:text-lg">
              از اولین ویزیت تا مراقبت‌های هر روز. با پت‌یار، صاحب حیوان و تیم درمان، تاریخچه سلامت و برنامه مراقبت را هماهنگ دنبال می‌کنند.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3.5 font-bold text-white shadow-lg shadow-emerald-800/15 hover:bg-emerald-800">
                مشاهده پنل صاحب پت <ArrowLeft className="size-4" />
              </Link>
              <Link href="/clinic" className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-6 py-3.5 font-bold text-emerald-800 hover:bg-emerald-50">
                پنل کلینیک <ArrowUpLeft className="size-4" />
              </Link>
            </div>
            <p className="mt-5 text-xs text-slate-500">نمای فعلی آزمایشی است. داده‌های نمایش‌داده‌شده، اطلاعات واقعی بیماران نیستند.</p>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-5 rounded-[3rem] bg-gradient-to-br from-teal-100 to-emerald-50 blur-xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-[0_30px_90px_-25px_rgba(10,85,74,.22)] sm:p-7">
              <div className="flex items-center justify-between">
                <div><p className="text-xs font-semibold text-emerald-700">نگاهی به داشبورد</p><h2 className="mt-1 text-xl font-extrabold text-slate-900">سلامت همراه کوچولوت</h2></div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">نمونه نمایشی</span>
              </div>
              <div className="mt-7 flex items-center gap-4 rounded-2xl bg-[#f2faf6] p-4">
                <div className="flex size-20 shrink-0 items-center justify-center rounded-3xl bg-[#d5eee5] text-5xl" aria-hidden="true">🐕</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between"><h3 className="text-lg font-bold">بامبو</h3><span className="text-xs text-emerald-700">پرونده فعال</span></div>
                  <p className="mt-2 text-sm text-slate-500">سگ · ۳ ساله · ۱۲٫۴ کیلوگرم</p>
                  <div className="mt-3 flex gap-2"><span className="rounded-lg bg-white px-2.5 py-1 text-xs text-slate-600">واکسیناسیون</span><span className="rounded-lg bg-white px-2.5 py-1 text-xs text-slate-600">تغذیه</span></div>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between"><h3 className="font-bold">برنامه مراقبت امروز</h3><CalendarCheck2 className="size-5 text-emerald-700" /></div>
              <div className="mt-3 space-y-3">
                {[
                  { icon: Check, name: "وعده صبحانه", time: "۰۸:۰۰", done: true },
                  { icon: Syringe, name: "پیگیری واکسن", time: "۱۱:۳۰", done: false },
                  { icon: ClipboardPlus, name: "ثبت وضعیت روزانه", time: "۲۰:۰۰", done: false },
                ].map(({ icon: Icon, name, time, done }) => (
                  <div key={name} className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3">
                    <span className={`flex size-9 items-center justify-center rounded-xl ${done ? "bg-emerald-100 text-emerald-700" : "bg-slate-50 text-slate-500"}`}><Icon className="size-4" /></span>
                    <span className="flex-1 text-sm font-semibold">{name}</span>
                    <span className="text-xs text-slate-400">{time}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800"><LockKeyhole className="size-4" /> اطلاعات سلامت فقط با مجوز معتبر به اشتراک گذاشته می‌شوند.</div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="max-w-2xl"><p className="font-semibold text-emerald-700">از ثبت تا مراقبت</p><h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">برای هر پت، پرونده‌ای به اندازه تمام عمر</h2><p className="mt-4 leading-8 text-slate-600">برای سگ، گربه، پرنده و هر گونه دیگر. اطلاعات پایه برای همه گونه‌ها قابل ثبت است؛ برنامه‌های بالینی نیازمند تأیید دامپزشک‌اند.</p></div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><Icon className="size-6" /></span>
              <h3 className="mt-5 text-lg font-extrabold">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="workflow" className="bg-[#eaf5f1] py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl"><p className="font-semibold text-emerald-700">یک مسیر روشن</p><h2 className="mt-2 text-3xl font-black">مراقبت هماهنگ، بدون پراکندگی</h2></div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              ["۰۱", "ثبت پروفایل", "مشخصات و سوابق حیوان را در یک پرونده اختصاصی نگه دارید."],
              ["۰۲", "ویزیت و برنامه مراقبت", "دامپزشک با مجوز، برنامه درمان و پیگیری را ثبت می‌کند."],
              ["۰۳", "پیگیری روزانه", "زمان‌بندی مراقبت‌ها و روند سلامت در دسترس صاحب پت است."],
            ].map(([number, title, desc]) => (
              <div key={number} className="rounded-3xl border border-white bg-white/75 p-8">
                <span className="text-3xl font-black text-emerald-400">{number}</span><h3 className="mt-5 text-lg font-extrabold">{title}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-slate-500 sm:px-8">
        <span className="flex items-center gap-2 font-bold text-emerald-800"><PawPrint className="size-5" /> پت‌یار</span>
        <span>پیش‌نمایش فاز اول · نسخه آزمایشی، بدون خدمات درمانی آنلاین</span>
      </footer>
    </main>
  );
}
