"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { LockKeyhole, PawPrint, ShieldCheck, Trash2 } from "lucide-react";

type Pet = { id: string; name: string };
type Clinic = { id: string; legal_name: string };
type Grant = {
  id: string; clinic_id: string; scope: string; expires_at: string | null;
  revoked_at: string | null; created_at: string;
};

async function readJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { credentials: "same-origin", cache: "no-store" });
  if (!response.ok) throw new Error(response.status === 401 ? "ابتدا وارد حساب شوید." : "سرویس پرونده یا کلینیک هنوز آماده نیست.");
  return await response.json() as T;
}

export default function SharingPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [petId, setPetId] = useState("");
  const [clinicId, setClinicId] = useState("");
  const [scope, setScope] = useState("read_summary");
  const [durationDays, setDurationDays] = useState("30");
  const [grants, setGrants] = useState<Grant[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void Promise.all([
      readJson<{ pets: Pet[] }>("/v1/pets"),
      readJson<{ clinics: Clinic[] }>("/v1/clinic/verified"),
    ]).then(([petsResult, clinicsResult]) => {
      if (!active) return;
      setPets(petsResult.pets);
      setClinics(clinicsResult.clinics);
      setPetId(petsResult.pets[0]?.id ?? "");
      setClinicId(clinicsResult.clinics[0]?.id ?? "");
      setLoading(false);
    }).catch((caught: unknown) => {
      if (active) { setError(caught instanceof Error ? caught.message : "خطای ارتباط"); setLoading(false); }
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!petId) return;
    let active = true;
    void readJson<{ grants: Grant[] }>(`/v1/pets/${petId}/grants`)
      .then((result) => { if (active) setGrants(result.grants); })
      .catch((caught: unknown) => { if (active) setError(caught instanceof Error ? caught.message : "خطا در دریافت دسترسی‌ها"); });
    return () => { active = false; };
  }, [petId]);

  async function reload() {
    if (!petId) return;
    const response = await readJson<{ grants: Grant[] }>(`/v1/pets/${petId}/grants`);
    setGrants(response.grants);
  }

  async function share(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError("");
    try {
      const response = await fetch(`/v1/pets/${petId}/grants`, {
        method: "POST", headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ clinicId, scope, durationDays: Number(durationDays) }),
      });
      if (!response.ok) throw new Error("مجوز ایجاد نشد؛ هویت و تأیید کلینیک را بررسی کنید.");
      await reload();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "خطای اشتراک‌گذاری"); }
    finally { setPending(false); }
  }

  async function revoke(grantId: string) {
    if (!petId) return;
    setPending(true); setError("");
    try {
      const response = await fetch(`/v1/pets/${petId}/grants/${grantId}/revoke`, {
        method: "POST", credentials: "same-origin",
      });
      if (!response.ok) throw new Error("لغو دسترسی انجام نشد.");
      await reload();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "خطای لغو دسترسی"); }
    finally { setPending(false); }
  }

  return (
    <main id="main-content" className="min-h-dvh bg-[#f4faf7] px-5 py-10">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-lg font-black text-emerald-800"><PawPrint /> پت‌یار</Link>
        <p className="mt-8 text-sm font-bold text-emerald-700">حریم خصوصی و مالکیت</p>
        <h1 className="mt-2 text-3xl font-black">اشتراک امن پرونده با کلینیک</h1>
        <p className="mt-3 text-sm leading-8 text-slate-600">دسترسی فقط به کلینیک تأییدشده داده می‌شود و تا مدت مشخص معتبر است. لغو دسترسی بلافاصله روی درخواست‌های بعدی اعمال می‌شود.</p>
        {loading ? <p role="status" className="mt-8 rounded-2xl bg-white p-6">در حال دریافت اطلاعات...</p> :
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <form onSubmit={share} className="space-y-4 rounded-3xl border bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-black"><ShieldCheck className="size-5 text-emerald-700" /> اعطای دسترسی</h2>
              <div><label htmlFor="share-pet" className="mb-2 block text-sm font-semibold">پت</label><select id="share-pet" required value={petId} onChange={(e) => setPetId(e.target.value)} className="w-full rounded-xl border p-3 text-sm"><option value="">انتخاب کنید</option>{pets.map((pet) => <option key={pet.id} value={pet.id}>{pet.name}</option>)}</select></div>
              <div><label htmlFor="share-clinic" className="mb-2 block text-sm font-semibold">کلینیک تأییدشده</label><select id="share-clinic" required value={clinicId} onChange={(e) => setClinicId(e.target.value)} className="w-full rounded-xl border p-3 text-sm"><option value="">انتخاب کنید</option>{clinics.map((clinic) => <option key={clinic.id} value={clinic.id}>{clinic.legal_name}</option>)}</select>{clinics.length === 0 && <p className="mt-2 text-xs text-amber-800">هنوز کلینیک تأییدشده‌ای در سامانه موجود نیست.</p>}</div>
              <div><label htmlFor="share-scope" className="mb-2 block text-sm font-semibold">سطح دسترسی</label><select id="share-scope" value={scope} onChange={(e) => setScope(e.target.value)} className="w-full rounded-xl border p-3 text-sm"><option value="read_summary">مشاهده خلاصه پرونده</option><option value="read_records">مشاهده سوابق پزشکی</option><option value="treatment">مجوز انجام درمان (پس از فعال‌سازی ماژول درمان)</option></select></div>
              <div><label htmlFor="share-days" className="mb-2 block text-sm font-semibold">مدت اعتبار (روز)</label><input id="share-days" type="number" min={1} max={90} required value={durationDays} onChange={(e) => setDurationDays(e.target.value)} className="w-full rounded-xl border p-3 text-sm" /></div>
              <button disabled={pending || !petId || !clinicId} type="submit" className="w-full rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white disabled:opacity-50">اعطای مجوز</button>
            </form>
            <section className="rounded-3xl border bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-black"><LockKeyhole className="size-5 text-emerald-700" /> مجوزهای صادرشده</h2>
              <div className="mt-5 space-y-3">
                {grants.length ? grants.map((grant) => (
                  <div key={grant.id} className="rounded-xl border p-4">
                    <p className="text-sm font-bold">{clinics.find((clinic) => clinic.id === grant.clinic_id)?.legal_name ?? "کلینیک"}</p>
                    <p className="mt-2 text-xs text-slate-600">نوع: {grant.scope} · پایان اعتبار: {grant.expires_at ? new Date(grant.expires_at).toLocaleDateString("fa-IR") : "نامشخص"}</p>
                    {grant.revoked_at ? <p className="mt-2 text-xs text-slate-500">لغوشده</p> :
                      <button disabled={pending} onClick={() => void revoke(grant.id)} type="button" className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-red-700 disabled:opacity-50"><Trash2 className="size-4" /> لغو مجوز</button>}
                  </div>
                )) : <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">هنوز مجوزی ثبت نشده است.</p>}
              </div>
            </section>
          </div>}
        {error && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error} <Link className="font-bold underline" href="/login">ورود به حساب</Link></p>}
        <Link href="/my-pets" className="mt-8 inline-block text-sm font-bold text-emerald-700">بازگشت به پت‌های من</Link>
      </div>
    </main>
  );
}
