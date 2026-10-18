"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <main id="main-content" className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center px-6 py-20">
      <p className="text-sm font-bold text-emerald-700">خطا در بارگذاری</p>
      <h1 className="mt-2 text-3xl font-black">نمایش این بخش امکان‌پذیر نشد</h1>
      <p className="mt-4 leading-8 text-muted-foreground">لطفاً دوباره تلاش کنید.</p>
      <div className="mt-8"><Button onClick={reset}>تلاش دوباره</Button></div>
    </main>
  );
}
