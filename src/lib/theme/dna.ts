export type ThemeId = "dark" | "light" | "dark-green" | "light-green" | "dark-red";

export const THEMES: { id: ThemeId; label: string; vars: Record<string,string> }[] = [
  {
    id: "dark",
    label: "Dark",
    vars: {
      "--bg": "0 0% 7%",
      "--surface": "0 0% 12%",
      "--surface-hover": "0 0% 17%",
      "--border": "0 0% 18%",
      "--text": "0 0% 96%",
      "--text-muted": "0 0% 55%",
      "--primary": "0 0% 96%",
      "--primary-text": "0 0% 8%",
    }
  },
  {
  id: "light",
  label: "Light",
  vars: {
    /* Clean base background */
    "--bg": "0 0% 92%",

    /* Shell/cards clearly visible */
    "--surface": "0 0% 100%",
    "--surface-hover": "0 0% 96%",

    /* THICKER / MORE VISIBLE SEPARATION */
    "--border": "0 0% 72%",

    /* Strong readable text */
    "--text": "0 0% 8%",
    "--text-muted": "0 0% 40%",

    /* Keep primary */
    "--primary": "0 0% 10%",
    "--primary-text": "0 0% 100%",
  }
},

  {
    id: "dark-green",
    label: "Dark Green",
    vars: {
      "--bg": "155 35% 5%",
      "--surface": "155 25% 10%",
      "--surface-hover": "155 20% 15%",
      "--border": "155 15% 18%",
      "--text": "140 20% 96%",
      "--text-muted": "150 10% 58%",
      "--primary": "142 75% 42%",
      "--primary-text": "0 0% 98%",
    }
  },
  {
    id: "light-green",
    label: "Light Green",
    vars: {
      "--bg": "142 45% 86%",
      "--surface": "142 30% 97%",
      "--surface-hover": "142 35% 90%",
      "--border": "142 25% 76%",
      "--text": "142 40% 10%",
      "--text-muted": "142 15% 42%",
      "--primary": "142 70% 28%",
      "--primary-text": "0 0% 98%",
    }
  },
  {
    id: "dark-red",
    label: "Dark Red",
    vars: {
      "--bg": "0 35% 6%",
      "--surface": "0 25% 11%",
      "--surface-hover": "0 20% 17%",
      "--border": "0 18% 20%",
      "--text": "0 15% 96%",
      "--text-muted": "0 10% 58%",
      "--primary": "0 85% 60%",
      "--primary-text": "0 0% 98%",
    }
  },
];
