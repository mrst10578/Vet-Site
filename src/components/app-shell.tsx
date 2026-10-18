import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Building2, HeartPulse, House, LockKeyhole, PawPrint, PlusCircle, ShieldCheck } from "lucide-react";

const links = [
  { href: "/dashboard", text: "داشبورد مالک", icon: House },
  { href: "/pets/new", text: "افزودن پت", icon: PlusCircle },
  { href: "/clinic", text: "پنل کلینیک", icon: Building2 },
  { href: "/my-pets", text: "پرونده‌های واقعی", icon: ShieldCheck },
  { href: "/sharing", text: "اشتراک امن پرونده", icon: LockKeyhole },
];

export function AppShell({
  eyebrow, title, description, children,
}: { eyebrow: string; title: string; description: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f9f7]">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2 text-xl font-black text-emerald-800">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-emerald-700 text-white"><PawPrint className="size-5" /></span>
            پترونوس
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-700"><ArrowLeft className="size-4" /> صفحه اصلی</Link>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-7 px-5 py-7 sm:px-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="h-fit rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-4 text-sm font-bold text-emerald-900"><HeartPulse className="size-5" /> میز کار پترونوس</div>
          <nav className="mt-4 flex flex-wrap gap-1 lg:flex-col" aria-label="صفحات سامانه">
            {links.map(({ href, text, icon: Icon }) => (
              <Link key={href} href={href} className="inline-flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"><Icon className="size-4" />{text}</Link>
            ))}
          </nav>
          <p className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-3 text-xs leading-6 text-amber-900">
            نسخه نمایشی: این محیط هنوز به حساب کاربری و پرونده‌های واقعی متصل نیست.
          </p>
        </aside>
        <main id="main-content" className="min-w-0">
          <p className="text-sm font-bold text-emerald-700">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-8 text-slate-600">{description}</p>
          <div className="mt-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
