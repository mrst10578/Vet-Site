import { expect, test } from "@playwright/test";

test("Persian home directs to the owner demo", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("تمام دنیای سلامت پت");
  await page.getByRole("link", { name: "مشاهده پنل صاحب پت" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("خونه پت‌هات");
});

test("pet preview accepts custom species without persisting medical data", async ({ page }) => {
  await page.goto("/pets/new");
  await page.getByLabel("نام حیوان *").fill("کیکی");
  await page.getByLabel("گونه *").selectOption("other");
  await expect(page.locator("#custom-species")).toBeVisible();
  await page.locator("#custom-species").fill("ایگوانا");
  await page.getByRole("button", { name: "ساخت پیش‌نمایش پروفایل" }).click();
  await expect(page.getByText("پیش‌نمایش ساخته شد؛ اطلاعات ذخیره نشده‌اند.")).toBeVisible();
  await expect(page.getByText("گونه: ایگوانا")).toBeVisible();
});

test("clinic dashboard clearly labels synthetic patients", async ({ page }) => {
  await page.goto("/clinic");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("میز کار کلینیک");
  await expect(page.getByText("مراجعین نمونه")).toBeVisible();
});
