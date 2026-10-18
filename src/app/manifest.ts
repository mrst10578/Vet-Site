import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "پترونوس | مدیریت سلامت حیوانات خانگی",
    short_name: "پترونوس",
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
