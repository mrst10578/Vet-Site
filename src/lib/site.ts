export const siteConfig = {
  name: "پتورا | Petora",
  description:
    "پتورا؛ فضای دوست‌داشتنی مدیریت سلامت حیوانات خانگی، مراقبت روزانه و هماهنگی ایمن با دامپزشک.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.CF_PAGES_STATIC === "1"
      ? "https://petora.pages.dev"
      : "http://localhost:3000"),
} as const;
