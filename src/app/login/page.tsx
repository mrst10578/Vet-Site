"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, KeyRound, LockKeyhole, PawPrint } from "lucide-react";

type Stage = "request" | "verify";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<Stage>("request");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const target = stage === "request" ? "/v1/auth/request-otp" : "/v1/auth/verify-otp";
    try {
      const response = await fetch(target, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(stage === "request" ? { phone } : { phone, code }),
      });
      if (!response.ok) {
        if (response.status === 404 || response.status === 502 || response.status === 503) throw new Error("سرویس ورود در این محیط هنوز فعال نشده است.");
        if (response.status === 429) throw new Error("درخواست‌ها زیاد بوده‌اند. کمی بعد دوباره تلاش کنید.");
        throw new Error(stage === "request" ? "ارسال کد انجام نشد؛ شماره و سرویس پیامک را بررسی کنید." : "کد اشتباه یا منقضی شده است.");
      }
      if (stage === "request") setStage("verify");
      else window.location.assign("/my-pets");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "ارتباط با سرویس برقرار نشد.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main id="main-content" className="flex min-h-dvh items-center justify-center bg-[#f3faf6] px-5 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-emerald-100 bg-white p-7 shadow-xl shadow-emerald-900/5 sm:p-9">
        <Link href="/" className="mb-7 inline-flex items-center gap-2 text-lg font-black text-emerald-800"><PawPrint className="size-6" /> پت‌یار</Link>
        <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">{stage === "request" ? <LockKeyhole /> : <KeyRound />}</div>
        <h1 className="text-2xl font-black">{stage === "request" ? "ورود به حساب پت‌یار" : "تأیید شماره همراه"}</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">{stage === "request" ? "شماره همراه را با پیش‌شماره کشور وارد کن تا کد تأیید ارسال شود." : "کد شش‌رقمی پیامک‌شده را وارد کن. اعتبار کد پنج دقیقه است."}</p>
        <form onSubmit={submit} className="mt-7 space-y-5">
          <div><label htmlFor="phone" className="mb-2 block text-sm font-bold">شماره همراه بین‌المللی</label><input id="phone" dir="ltr" inputMode="tel" autoComplete="tel" value={phone} disabled={stage === "verify"} onChange={(e) => setPhone(e.target.value)} required pattern="\+[1-9][0-9]{7,14}" placeholder="+989123456789" className="w-full rounded-xl border bg-white px-4 py-3 text-left text-sm disabled:bg-slate-100" /></div>
          {stage === "verify" && <div><label htmlFor="code" className="mb-2 block text-sm font-bold">کد یک‌بارمصرف</label><input id="code" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" required value={code} onChange={(e) => setCode(e.target.value)} placeholder="000000" dir="ltr" className="w-full rounded-xl border bg-white px-4 py-3 text-center text-lg tracking-[.4em]" /></div>}
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm leading-6 text-red-700">{error}</p>}
          <button disabled={busy} type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3.5 font-bold text-white disabled:opacity-50">{busy ? "لطفاً صبر کنید..." : stage === "request" ? "دریافت کد" : "تأیید و ورود"}<ArrowLeft className="size-4" /></button>
          {stage === "verify" && <button type="button" onClick={() => { setStage("request"); setCode(""); setError(""); }} className="w-full text-sm font-bold text-emerald-700">اصلاح شماره همراه</button>}
        </form>
        <p className="mt-7 rounded-xl bg-amber-50 p-3 text-xs leading-6 text-amber-900">ورود واقعی فقط پس از تنظیم سرویس پیامک، دیتابیس و استقرار API فعال است. هیچ کد نمایشی یا ورود ساختگی پذیرفته نمی‌شود.</p>
      </div>
    </main>
  );
}
