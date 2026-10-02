import CreateSheet from "./create-sheet";
import FavoritesSheet from "./favorites-sheet";
import DownloadsSheet from "./downloads-sheet";
import AlertsSheet from "./alerts-sheet";
import MoreSheet from "./more-sheet";

export type SheetId = "create" | "favorites" | "downloads" | "alerts" | "more";

export const SHEET_REGISTRY: Record<SheetId, { label: string; component: React.ComponentType }> = {
  create: { label: "Create", component: CreateSheet },
  favorites: { label: "Favorites", component: FavoritesSheet },
  downloads: { label: "Downloads", component: DownloadsSheet },
  alerts: { label: "Alerts", component: AlertsSheet },
  more: { label: "More", component: MoreSheet },
};

export const SHEET_ORDER: SheetId[] = ["create", "favorites", "downloads", "alerts", "more"];
