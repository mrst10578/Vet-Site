export type ReminderStatus = "completed" | "overdue" | "due-today" | "upcoming";
export type Reminder = { dueDate: string; completedAt?: string | null };
export type ReminderAssessment = { status: ReminderStatus; daysUntilDue: number; shouldNotify: boolean };

function dayNumber(isoDate: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) throw new Error("Invalid ISO calendar date");
  const [year, month, day] = isoDate.split("-").map(Number);
  const timestamp = Date.UTC(year, month - 1, day);
  const parsed = new Date(timestamp);
  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) {
    throw new Error("Invalid ISO calendar date");
  }
  return Math.round(timestamp / 86_400_000);
}

export function assessReminder(reminder: Reminder, todayIso: string): ReminderAssessment {
  const remaining = dayNumber(reminder.dueDate) - dayNumber(todayIso);
  if (reminder.completedAt) return { status: "completed", daysUntilDue: remaining, shouldNotify: false };
  if (remaining < 0) return { status: "overdue", daysUntilDue: remaining, shouldNotify: true };
  if (remaining === 0) return { status: "due-today", daysUntilDue: 0, shouldNotify: true };
  return { status: "upcoming", daysUntilDue: remaining, shouldNotify: [14, 7, 1].includes(remaining) };
}

// Callers must provide the date in the user's configured timezone.
// This is date-based classification, not a job scheduler or a medication dosing engine.
