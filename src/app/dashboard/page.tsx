import Link from "next/link";
import { ArrowUpLeft, Bell, CalendarDays, FileHeart, Plus, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { CareChecklist } from "@/components/care-checklist";
import { demoPets } from "@/lib/demo-data";

export const metadata = { title: "داشبورد صاحب پت" };

export default function OwnerDashboard() {
  return (
    <AppShell eyebrow="پنل صاحب حیوان · پیش‌نمایش" title="سلام، به خونه پت‌هات خوش اومدی" description="پرونده حیوانات و برنامه روزانه را یکجا ببین. اطلاعات زیر نمونه هستند و مربوط به حساب واقعی نیستند.">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: FileHeart, label: "پروفایل‌های نمایشی", value: "۳ پت" },
          { icon: CalendarDays, label: "فعالیت‌های امروز", value: "۳ مورد" },
          { icon: Bell, label: "اعلان‌های واقعی", value: "غیرفعال" },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <Icon className="size-6 text-emerald-700" /><p className="mt-4 text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-black">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-black">حیوانات من</h2><Link href="/pets/new" className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white"><Plus className="size-4" /> ثبت مشخصات پت</Link></div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {demoPets.map((pet) => (
          <article key={pet.id} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between"><span className="flex size-16 items-center justify-center rounded-2xl bg-emerald-50 text-4xl" aria-hidden="true">{pet.emoji}</span><span className="rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-500">نمونه</span></div>
            <h3 className="mt-4 text-lg font-black">{pet.name}</h3>
            <p className="mt-2 text-sm text-slate-500">{pet.species} · {pet.breed}</p>
            <p className="mt-2 text-xs text-slate-500">{pet.age} · {pet.weight}</p>
            {pet.alert ? <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">{pet.alert} (نمونه)</div> : null}
            <div className="mt-5 flex items-center justify-between border-t pt-4 text-xs text-slate-500"><span>پرونده نمایشی</span><ArrowUpLeft className="size-4" /></div>
          </article>
        ))}
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-[1.3fr_.7fr]">
        <CareChecklist />
        <aside className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <ShieldCheck className="size-7 text-emerald-700" /><h2 className="mt-4 text-lg font-black">حریم خصوصی در اولویت</h2>
          <p className="mt-3 text-sm leading-8 text-slate-600">دسترسی کلینیک به پرونده باید با مجوز مالک صادر و هر زمان قابل لغو باشد. این قابلیت پس از اتصال سامانه احراز هویت فعال می‌شود.</p>
          <Link href="/clinic" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-emerald-700">مشاهده نمای کلینیک <ArrowUpLeft className="size-4" /></Link>
        </aside>
      </div>
    </AppShell>
  );
}
