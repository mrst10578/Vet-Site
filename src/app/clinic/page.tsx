import Link from "next/link";
import { ClipboardList, FileClock, LockKeyhole, Stethoscope, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { demoPatients } from "@/lib/demo-data";

export const metadata = { title: "میز کار کلینیک" };

export default function ClinicDashboard() {
  return (
    <AppShell eyebrow="پنل دامپزشک و کلینیک · پیش‌نمایش" title="میز کار کلینیک" description="نمای اولیه مدیریت بیماران، ویزیت‌ها و ثبت درمان. داده‌ها ساختگی هستند و هیچ دسترسی به پرونده واقعی در این نسخه وجود ندارد.">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Users, title: "بیماران نمونه", value: "۳" },
          { icon: Stethoscope, title: "ویزیت‌های نمونه", value: "۳" },
          { icon: FileClock, title: "نسخه‌های صادرشده", value: "۰" },
        ].map(({ icon: Icon, title, value }) => (
          <div key={title} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"><Icon className="size-6 text-emerald-700" /><p className="mt-4 text-sm text-slate-500">{title}</p><p className="mt-2 text-3xl font-black">{value}</p></div>
        ))}
      </div>
      <section className="mt-8 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm" aria-labelledby="patients-title">
        <div className="flex items-center gap-3 border-b px-6 py-5"><ClipboardList className="size-5 text-emerald-700" /><h2 id="patients-title" className="text-lg font-black">مراجعین نمونه</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-right text-sm">
            <thead className="bg-slate-50 text-slate-500"><tr><th scope="col" className="p-4">شناسه</th><th scope="col" className="p-4">نام پت</th><th scope="col" className="p-4">گونه</th><th scope="col" className="p-4">مالک نمایشی</th><th scope="col" className="p-4">موضوع</th><th scope="col" className="p-4">وضعیت</th></tr></thead>
            <tbody>{demoPatients.map((pet) => <tr key={pet.id} className="border-t"><td className="p-4 text-slate-500" dir="ltr">{pet.id}</td><td className="p-4 font-bold">{pet.name}</td><td className="p-4">{pet.species}</td><td className="p-4">{pet.owner}</td><td className="p-4">{pet.visit}</td><td className="p-4"><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-800">{pet.state}</span></td></tr>)}</tbody>
          </table>
        </div>
      </section>
      <Link href="/clinic/live" className="mt-6 inline-flex rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white">ورود به پرونده‌های مجاز کلینیک</Link>
      <div className="mt-6 flex gap-3 rounded-3xl border border-amber-100 bg-amber-50 p-5 text-sm leading-7 text-amber-900"><LockKeyhole className="mt-1 size-6 shrink-0" /><p>ثبت نسخه، مشاهده پرونده واقعی، اعطای دسترسی پزشک و تغییرات بالینی فقط پس از پیاده‌سازی احراز هویت، اعتبارسنجی مجوز حرفه‌ای و کنترل دسترسی سمت سرور فعال می‌شوند.</p></div>
    </AppShell>
  );
}
