export type ThemeId = "dark" | "light" | "dark-green" | "light-green" | "dark-red";

export function setTheme(themeId: ThemeId) {
  if (themeId === "dark") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", themeId);
  }
  localStorage.setItem("ug-theme", themeId);
}

export function initTheme() {
  const saved = (localStorage.getItem("ug-theme") as ThemeId) || "dark";
  if (saved === "dark") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", saved);
  }
  return saved;
}
