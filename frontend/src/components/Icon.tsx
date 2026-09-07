import type { SVGProps } from "react";

const paths = {
  trash: "M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16ZM10 11v6M14 11v6",
  alertTriangle: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3ZM12 9v4M12 17h.01",
  plus: "M12 5v14M5 12h14",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z",
  listBullet: "M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01",
  listNumbered: "M10 6h11M10 12h11M10 18h11M4 4h1.5v4H4M4 4v0M4.5 10h1.5M4 14h2.5c0 .8-2.5 2-2.5 4h2.5",
  quote: "M4 5h6v7H6c0 3 1 4 3 5l-2 2c-4-2-5-5-5-8V5h2Zm12 0h6v7h-4c0 3 1 4 3 5l-2 2c-4-2-5-5-5-8V5h2Z",
  compass: "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0m-6-14-3 9-9 3 3-9 9-3Z",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  copy: "M8 8h13v13H8zM16 8V3H3v13h5",
  download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  diagonal: "M7 17 17 7M7 7h10v10",
  code: "m8 7-5 5 5 5m8-10 5 5-5 5m-3-14-2 18",
  book: "M4 4h6l2 2 2-2h6v15h-6l-2 2-2-2H4V4Zm8 2v15",
  layers: "m12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 16l10 5 10-5",
  spark: "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z",
  check: "m5 12 4 4L19 6",
  clock: "M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M13 3.13a4 4 0 0 1 0 7.75M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  search: "m21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  calendar: "M8 2v4m8-4v4M3 10h18M3 5h18v16H3z",
  logout: "M9 3H3v18h6m6-14 5 5-5 5M9 12h11",
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "m6 6 12 12M6 18 18 6",
  shield: "m12 3 8 4v6c0 5-8 9-8 9s-8-4-8-9V7l8-4Zm-4 9 3 3 5-6",
  globe: "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0M2 12h20M12 2c6 6 6 14 0 20-6-6-6-14 0-20",
  terminal: "m5 7 5 5-5 5m8 0h6",
  chevron: "m8 10 4 4 4-4",
  mail: "M3 5h18v14H3zM3 5l9 8 9-8",
  sun: "M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0",
  moon: "M20.8 13A9 9 0 0 1 11 3.2 9 9 0 1 0 20.8 13Z",
  monitor: "M3 3h18v14H3zM12 17v4M8 21h8",
} as const;
export type IconName = keyof typeof paths;
export function Icon({ name, size = 20, ...props }: SVGProps<SVGSVGElement> & { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d={paths[name]} /></svg>;
}
