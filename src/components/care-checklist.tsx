"use client";

import { useState } from "react";
import { Check, Clock3 } from "lucide-react";
import { demoTasks } from "@/lib/demo-data";

export function CareChecklist() {
  const [done, setDone] = useState<string[]>([]);
  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm" aria-labelledby="care-title">
      <div className="flex items-center justify-between gap-3">
        <h2 id="care-title" className="text-lg font-black">برنامه مراقبت امروز</h2>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-800">{done.length} از {demoTasks.length} انجام شد</span>
      </div>
      <p className="mt-2 text-xs leading-6 text-slate-500">تیک‌ها فقط در همین پیش‌نمایش تغییر می‌کنند و در پرونده پزشکی ذخیره نمی‌شوند.</p>
      <div className="mt-5 space-y-3">
        {demoTasks.map((task) => {
          const checked = done.includes(task.id);
          return (
            <label key={task.id} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-100 p-4 hover:bg-slate-50">
              <input
                type="checkbox"
                className="size-5 accent-emerald-700"
                checked={checked}
                onChange={(e) => setDone((prev) => e.target.checked ? [...prev, task.id] : prev.filter((id) => id !== task.id))}
                aria-label={`انجام ${task.title} برای ${task.pet}`}
              />
              <div className="flex-1"><p className={`text-sm font-bold ${checked ? "text-slate-400 line-through" : ""}`}>{task.title}</p><p className="mt-1 text-xs text-slate-500">{task.pet} · {task.category}</p></div>
              {checked ? <Check className="size-4 text-emerald-600" /> : <Clock3 className="size-4 text-slate-400" />}
              <span className="text-xs text-slate-500">{task.time}</span>
            </label>
          );
        })}
      </div>
    </section>
  );
}
