// Title Matrix — pro cinematic fonts
export type TitleFontId = "cinzel" | "bebas" | "oswald" | "anton" | "playfair" | "archivo" | "montserrat" | "inter" | "sync";

export const TITLE_FONTS: { id: TitleFontId; label: string; family: string; google: string; spacing: string; weight: number; syncCover?: boolean }[] = [
  { id: "cinzel",     label: "Cinzel — Epic",      family: "'Cinzel', serif",           google: "Cinzel:wght@700;900",          spacing: "0.18em", weight: 900 },
  { id: "bebas",      label: "Bebas — Poster",     family: "'Bebas Neue', sans-serif", google: "Bebas+Neue",                  spacing: "0.12em", weight: 400 },
  { id: "oswald",     label: "Oswald — Trailer",   family: "'Oswald', sans-serif",      google: "Oswald:wght@600;700",          spacing: "0.14em", weight: 700 },
  { id: "anton",      label: "Anton — Bold",       family: "'Anton', sans-serif",       google: "Anton",                      spacing: "0.04em", weight: 400 },
  { id: "playfair",   label: "Playfair — Drama",   family: "'Playfair Display', serif", google: "Playfair+Display:wght@800;900", spacing: "0.02em", weight: 900 },
  { id: "archivo",    label: "Archivo — Modern",   family: "'Archivo Black', sans-serif", google: "Archivo+Black",              spacing: "0.02em", weight: 400 },
  { id: "montserrat", label: "Montserrat — Clean", family: "'Montserrat', sans-serif",   google: "Montserrat:wght@800;900",      spacing: "0.10em", weight: 900 },
  { id: "inter",      label: "Inter — Minimal",    family: "'Inter', sans-serif",       google: "Inter:wght@800;900",           spacing: "-0.02em", weight: 900 },
  // SYNC — same look as Cinzel Epic, but color = cover color (sampled from poster)
  { id: "sync",       label: "Sync — Cover Color", family: "'Cinzel', serif",           google: "Cinzel:wght@700;900",          spacing: "0.18em", weight: 900, syncCover: true },
];

export function fontLink() {
  const fams = TITLE_FONTS.map(f => `family=${f.google}`).join("&");
  return `https://fonts.googleapis.com/css2?${fams}&display=swap`;
}
export function fontById(id: string) { return TITLE_FONTS.find(f => f.id === id) || TITLE_FONTS[0]; }

// Sample the cover's dominant color — average of centre pixels, lightened so it reads on the poster
export async function coverColor(coverUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const c = document.createElement("canvas");
        c.width = 20; c.height = 20;
        const ctx = c.getContext("2d")!;
        ctx.drawImage(img, 0, 0, 20, 20);
        const d = ctx.getImageData(6, 6, 8, 8).data;
        let r = 0, g = 0, b = 0, n = 0;
        for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i+1]; b += d[i+2]; n++; }
        r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
        // Lighten toward white so it pops on dark posters, keep the hue
        const mix = (v: number) => Math.round(v + (255 - v) * 0.35);
        resolve(`rgb(${mix(r)},${mix(g)},${mix(b)})`);
      } catch { resolve("#fff"); }
    };
    img.onerror = () => resolve("#fff");
    img.src = coverUrl;
  });
}

