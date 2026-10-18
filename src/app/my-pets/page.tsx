"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, LogIn, PawPrint, PlusCircle, ShieldCheck } from "lucide-react";

type Pet = {
  id: string;
  name: string;
  species_label: string;
  breed: string | null;
  sex: "female" | "male" | "unknown";
  birth_date: string | null;
};

export default function MyPetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"ready" | "unauthorized" | "unavailable">("ready");
  const [name, setName] = useState("");
  const [speciesCode, setSpeciesCode] = useState("dog");
  const [customSpecies, setCustomSpecies] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    try {
      const response = await fetch("/v1/pets", { cache: "no-store", credentials: "same-origin" });
      if (response.status === 401) { setStatus("unauthorized"); return; }
      if (!response.ok) throw new Error();
      const result = (await response.json()) as { pets: Pet[] };
      setPets(result.pets);
      setStatus("ready");
    } catch { setStatus("unavailable"); }
    finally { setLoading(false); }
  }

  useEffect(() => { void refresh(); }, []);

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      const response = await fetch("/v1/pets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name, speciesCode, customSpecies }),
      });
      if (!response.ok) throw new Error(response.status === 401 ? "ابتدا وارد حساب شوید." : "ثبت پت انجام نشد؛ اطلاعات یا اتصال سرور را بررسی کنید.");
      setName(""); setCustomSpecies("");
      await refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "خطا در ثبت پت"); }
    finally { setBusy(false); }
  }

  return (
    <main id="main-content" className="min-h-dvh bg-[#f4faf7]">
      <header className="border-b bg-white"><div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4"><Link href="/" className="flex items-center gap-2 font-black text-emerald-800"><PawPrint /> پت‌یار</Link><Link href="/dashboard" className="text-sm font-semibold text-emerald-700">داشبورد نمایشی</Link></div></header>
      <div className="mx-auto max-w-5xl px-5 py-10">
        <p className="text-sm font-bold text-emerald-700">حساب واقعی · دسترسی مالک</p><h1 className="mt-2 text-3xl font-black">پت‌های من</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">این صفحه فقط داده‌های ثبت‌شده در سرور و متعلق به حساب واردشده را می‌خواند. اطلاعات نمایشی به اینجا منتقل نمی‌شوند.</p>
        {loading ? <p role="status" className="mt-8 rounded-2xl bg-white p-6">در حال بررسی نشست و پرونده‌ها...</p> :
          status === "unauthorized" ? <div className="mt-8 rounded-3xl bg-white p-8"><h2 className="font-black">ورود لازم است</h2><Link href="/login" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-white"><LogIn className="size-4" /> ورود به حساب</Link></div> :
          status === "unavailable" ? <div className="mt-8 rounded-3xl bg-amber-50 p-8"><h2 className="font-black">سرویس پرونده هنوز در دسترس نیست</h2><p className="mt-3 text-sm">راه‌اندازی و اتصال بک‌اند و دیتابیس برای دسترسی واقعی لازم است.</p><button onClick={() => { setLoading(true); void refresh(); }} className="mt-5 text-sm font-bold text-emerald-700">تلاش دوباره</button></div> :
          <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_.9fr]">
            <section className="rounded-3xl border bg-white p-6 shadow-sm"><h2 className="text-lg font-black">پرونده‌های ثبت‌شده</h2>
              {pets.length === 0 ? <p className="mt-5 rounded-xl bg-slate-50 p-5 text-sm text-slate-600">هنوز حیوانی به حساب اضافه نشده است.</p> :
                <ul className="mt-5 space-y-3">{pets.map((pet) => <li key={pet.id} className="rounded-xl border p-4"><p className="font-bold">{pet.name}</p><p className="mt-1 text-sm text-slate-600">{pet.species_label} · {pet.breed || "بدون نژاد ثبت‌شده"}</p></li>)}</ul>}
              <p className="mt-5 flex items-center gap-2 text-xs text-slate-500"><ShieldCheck className="size-4" /> فهرست با مجوز مالک از سمت سرور دریافت می‌شود.</p>
            </section>
            <form onSubmit={create} className="h-fit space-y-4 rounded-3xl border bg-white p-6 shadow-sm"><h2 className="flex items-center gap-2 text-lg font-black"><PlusCircle className="size-5 text-emerald-700" /> ثبت پت در حساب</h2>
              <div><label htmlFor="real-name" className="mb-2 block text-sm font-bold">نام پت</label><input id="real-name" required minLength={2} maxLength={120} value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border p-3 text-sm" /></div>
              <div><label htmlFor="real-species" className="mb-2 block text-sm font-bold">گونه</label><select id="real-species" value={speciesCode} onChange={(e) => setSpeciesCode(e.target.value)} className="w-full rounded-xl border p-3 text-sm"><option value="dog">سگ</option><option value="cat">گربه</option><option value="bird">پرنده</option><option value="rabbit">خرگوش</option><option value="rodent">جونده</option><option value="reptile">خزنده</option><option value="fish">ماهی</option><option value="other">گونه دیگر</option></select></div>
              {speciesCode === "other" && <div><label htmlFor="real-custom" className="mb-2 block text-sm font-bold">نام گونه</label><input id="real-custom" required minLength={2} maxLength={80} value={customSpecies} onChange={(e) => setCustomSpecies(e.target.value)} className="w-full rounded-xl border p-3 text-sm" /></div>}
              {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              <button disabled={busy} type="submit" className="w-full rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white disabled:opacity-50">{busy ? "در حال ثبت..." : "ثبت در حساب واقعی"}</button>
              <p className="text-xs leading-6 text-slate-500">هیچ پروتکل واکسن یا دارویی بر اساس گونه به‌صورت خودکار تعیین نمی‌شود.</p>
            </form>
          </div>
        }
        <Link href="/" className="mt-10 inline-flex items-center gap-2 text-sm font-bold text-emerald-700"><ArrowLeft className="size-4" /> صفحه اصلی</Link>
      </div>
    </main>
  );
}
