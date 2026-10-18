"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { CheckCircle2, PlusCircle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { commonSpecies, normalizeSpecies } from "@/lib/domain/species";

type FormData = {
  name: string; speciesCode: string; customSpecies: string; breed: string; birthDate: string; sex: string;
};

const initial: FormData = { name: "", speciesCode: "dog", customSpecies: "", breed: "", birthDate: "", sex: "unknown" };

export default function NewPetPage() {
  const [data, setData] = useState<FormData>(initial);
  const [preview, setPreview] = useState<{ name: string; species: string; breed: string } | null>(null);
  const [error, setError] = useState("");
  function update(name: keyof FormData, value: string) { setData((prev) => ({ ...prev, [name]: value })); setError(""); }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const petName = data.name.trim();
      if (petName.length < 2 || petName.length > 80) throw new Error("نام پت باید بین ۲ تا ۸۰ نویسه باشد.");
      const species = normalizeSpecies(data);
      if (data.birthDate && data.birthDate > new Date().toISOString().slice(0, 10)) throw new Error("تاریخ تولد نمی‌تواند در آینده باشد.");
      setPreview({ name: petName, species, breed: data.breed.trim() || "ثبت نشده" });
    } catch (caught) { setError(caught instanceof Error ? caught.message : "اطلاعات فرم معتبر نیست."); }
  }

  return (
    <AppShell eyebrow="ساخت پروفایل · پیش‌نمایش" title="معرفی عضو جدید خانواده" description="فرم ثبت اولیه برای همه گونه‌های حیوانات طراحی شده است. در این نسخه داده‌ها فقط برای پیش‌نمایش استفاده می‌شوند و روی سرور ذخیره نمی‌شوند.">
      <div className="grid gap-6 lg:grid-cols-[1.3fr_.7fr]">
        <form onSubmit={submit} className="space-y-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="flex items-center gap-2 text-lg font-black"><PlusCircle className="size-5 text-emerald-700" /> مشخصات اولیه پت</h2>
          <div><label htmlFor="pet-name" className="mb-2 block text-sm font-bold">نام حیوان *</label><input id="pet-name" name="name" required minLength={2} maxLength={80} value={data.name} onChange={(e) => update("name", e.target.value)} placeholder="مثلاً بامبو" className="w-full rounded-xl border bg-white px-4 py-3 text-sm" /></div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div><label htmlFor="species" className="mb-2 block text-sm font-bold">گونه *</label><select id="species" value={data.speciesCode} onChange={(e) => update("speciesCode", e.target.value)} className="w-full rounded-xl border bg-white px-4 py-3 text-sm">{commonSpecies.map((species) => <option key={species.code} value={species.code}>{species.label}</option>)}</select></div>
            <div><label htmlFor="breed" className="mb-2 block text-sm font-bold">نژاد (اختیاری)</label><input id="breed" value={data.breed} maxLength={120} onChange={(e) => update("breed", e.target.value)} placeholder="نژاد یا میکس" className="w-full rounded-xl border bg-white px-4 py-3 text-sm" /></div>
          </div>
          {data.speciesCode === "other" && <div><label htmlFor="custom-species" className="mb-2 block text-sm font-bold">نام گونه *</label><input id="custom-species" value={data.customSpecies} required minLength={2} maxLength={80} onChange={(e) => update("customSpecies", e.target.value)} placeholder="مثلاً ایگوانا" className="w-full rounded-xl border bg-white px-4 py-3 text-sm" /></div>}
          <div className="grid gap-5 sm:grid-cols-2">
            <div><label htmlFor="birth-date" className="mb-2 block text-sm font-bold">تاریخ تولد (اختیاری)</label><input id="birth-date" type="date" value={data.birthDate} onChange={(e) => update("birthDate", e.target.value)} className="w-full rounded-xl border bg-white px-4 py-3 text-sm" /></div>
            <div><label htmlFor="pet-sex" className="mb-2 block text-sm font-bold">جنسیت</label><select id="pet-sex" value={data.sex} onChange={(e) => update("sex", e.target.value)} className="w-full rounded-xl border bg-white px-4 py-3 text-sm"><option value="unknown">نامشخص</option><option value="male">نر</option><option value="female">ماده</option></select></div>
          </div>
          {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <button type="submit" className="w-full rounded-xl bg-emerald-700 px-5 py-3.5 text-sm font-bold text-white hover:bg-emerald-800">ساخت پیش‌نمایش پروفایل</button>
          <p className="text-xs leading-6 text-slate-500">برای ثبت واقعی، ابتدا احراز هویت، رضایت‌نامه و ذخیره‌سازی امن سمت سرور پیاده‌سازی می‌شود.</p>
        </form>
        <aside className="h-fit rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="font-black">پروفایل آماده نمایش</h2>
          {preview ? <div aria-live="polite" className="mt-6 rounded-2xl bg-emerald-50 p-5"><CheckCircle2 className="size-8 text-emerald-700" /><h3 className="mt-4 text-xl font-black">{preview.name}</h3><p className="mt-3 text-sm text-slate-600">گونه: {preview.species}</p><p className="mt-2 text-sm text-slate-600">نژاد: {preview.breed}</p><p className="mt-4 text-xs leading-6 text-emerald-800">پیش‌نمایش ساخته شد؛ اطلاعات ذخیره نشده‌اند.</p></div> : <p className="mt-4 text-sm leading-8 text-slate-500">بعد از تکمیل فرم، پیش‌نمایش پروفایل اینجا نشان داده می‌شود.</p>}
          <Link href="/dashboard" className="mt-6 block text-sm font-bold text-emerald-700">بازگشت به داشبورد</Link>
        </aside>
      </div>
    </AppShell>
  );
}
