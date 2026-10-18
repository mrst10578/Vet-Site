import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main-content" className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center px-6 py-20">
      <p className="text-sm font-bold text-emerald-700">۴۰۴</p>
      <h1 className="mt-2 text-4xl font-black">این صفحه پیدا نشد</h1>
      <p className="mt-4 leading-8 text-muted-foreground">ممکن است نشانی صفحه تغییر کرده باشد.</p>
      <div className="mt-8"><Link href="/" className={buttonVariants()}>بازگشت به صفحه اصلی</Link></div>
    </main>
  );
}
