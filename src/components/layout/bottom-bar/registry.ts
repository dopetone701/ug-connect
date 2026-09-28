export const UNIVERSAL_ENABLED = false; // false = launch mode, movies bar everywhere. true = universal on / only

export const SERVICE_PREFIXES = {
  movies: "/movies",
  jobs: "/jobs",
  food: "/ug-foods",
  mmoney: "/mobile-money",
};

export function get-bar-type(pathname: string) {
  if (!UNIVERSAL_ENABLED) {
    if (pathname === "/" || pathname.startsWith("/services")) return "universal-hidden";
    return "movies";
  }
  if (pathname.startsWith(SERVICE_PREFIXES.movies)) return "movies";
  if (pathname.startsWith(SERVICE_PREFIXES.jobs)) return "jobs";
  if (pathname.startsWith(SERVICE_PREFIXES.food)) return "food";
  if (pathname.startsWith(SERVICE_PREFIXES.mmoney)) return "mmoney";
  if (pathname === "/" || pathname === "/services") return "universal";
  return "movies";
}
