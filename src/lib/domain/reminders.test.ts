import { describe, expect, it } from "vitest";
import { assessReminder } from "./reminders";

describe("assessReminder", () => {
  it("notifies at 14, 7, 1 and due-day milestones", () => {
    for (const [today, expected] of [["2026-09-16", true], ["2026-09-23", true], ["2026-09-29", true], ["2026-09-30", true], ["2026-09-25", false]] as const) {
      expect(assessReminder({ dueDate: "2026-09-30" }, today).shouldNotify).toBe(expected);
    }
  });
  it("does not notify completed items", () => {
    expect(assessReminder({ dueDate: "2026-09-30", completedAt: "2026-09-01T12:00:00Z" }, "2026-09-30").status).toBe("completed");
  });
  it("recognizes overdue reminders", () => {
    expect(assessReminder({ dueDate: "2026-09-30" }, "2026-10-01").status).toBe("overdue");
  });
  it("handles leap years and rejects impossible dates", () => {
    expect(assessReminder({ dueDate: "2028-02-29" }, "2028-02-28").daysUntilDue).toBe(1);
    expect(() => assessReminder({ dueDate: "2027-02-29" }, "2027-02-28")).toThrow();
  });
});
