"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Building2, LockKeyhole, PawPrint } from "lucide-react";

type Patient = { id: string; name: string; species_label: string; clinic_id: string; clinic_name: string; scope: string };

export default function ClinicLivePage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    void fetch("/v1/clinic/patients", { credentials: "same-origin", cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(response.status === 401 ? "برای مشاهده بیماران باید وارد حساب شوید." : "سرویس کلینیک در دسترس نیست.");
        const data = (await response.json()) as { patients: Patient[] };
        if (active) { setPatients(data.patients); setLoading(false); }
      }).catch((caught: unknown) => {
        if (active) {
          setMessage(caught instanceof Error ? caught.message : "خطا در بارگذاری");
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, []);

  return (
    <main id="main-content" className="min-h-dvh bg-[#f4faf7] px-5 py-10">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="inline-flex items-center gap-2 text-lg font-black text-emerald-800"><PawPrint /> پت‌یار</Link>
        <p className="mt-8 text-sm font-bold text-emerald-700">پنل کلینیک · اطلاعات واقعی و مجاز</p>
        <h1 className="mt-2 text-3xl font-black">بیماران تحت نظر کلینیک</h1>
        <p className="mt-3 text-sm leading-8 text-slate-600">فهرست تنها برای دامپزشک یا مدیر تأییدشده کلینیک و فقط با مجوز فعال مالک نمایش داده می‌شود. نسخه‌نویسی هنوز فعال نیست.</p>
        <section className="mt-8 rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-black"><Building2 className="size-5 text-emerald-700" /> فهرست پرونده‌های مجاز</h2>
          {loading ? <p role="status" className="mt-6 text-sm">در حال بررسی دسترسی...</p> : message ? <p role="alert" className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{message} <Link href="/login" className="font-bold underline">ورود</Link></p> :
            patients.length === 0 ? <p className="mt-6 rounded-xl bg-slate-50 p-5 text-sm leading-7 text-slate-600">پرونده مجازی برای این حساب یافت نشد. عضویت تأییدشده در کلینیک و مجوز معتبر مالک لازم است.</p> :
              <div className="mt-5 space-y-3">{patients.map((patient) => (
                <div key={`${patient.id}:${patient.clinic_id}:${patient.scope}`} className="rounded-xl border p-4">
                  <h3 className="font-bold">{patient.name}</h3>
                  <p className="mt-2 text-sm text-slate-500">{patient.species_label} · {patient.clinic_name}</p>
                  <p className="mt-2 text-xs text-emerald-700">مجوز: {patient.scope}</p>
                </div>
              ))}</div>}
          <p className="mt-7 flex items-center gap-2 text-xs text-slate-500"><LockKeyhole className="size-4" /> دسترسی فقط با بررسی مجوز سمت سرور</p>
        </section>
        <Link href="/clinic" className="mt-8 inline-block text-sm font-bold text-emerald-700">بازگشت به پیش‌نمایش کلینیک</Link>
      </div>
    </main>
  );
}
