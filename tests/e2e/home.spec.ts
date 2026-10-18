import { expect, test } from "@playwright/test";

test("Persian landing and owner navigation render", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("lang", "fa");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("تمام دنیای سلامت پت");
  await expect(page.getByRole("link", { name: "مشاهده پنل صاحب پت" })).toBeVisible();
});
