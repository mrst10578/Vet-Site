import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "پت‌یار | مدیریت سلامت حیوانات خانگی",
    short_name: "پت‌یار",
    description: "داشبورد مراقبت و پرونده سلامت حیوانات خانگی",
    start_url: "/",
    display: "standalone",
    background_color: "#f7faf9",
    theme_color: "#137f72",
    lang: "fa",
    dir: "rtl",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any", purpose: "any" },
    ],
  };
}
