import CreateSheet from "./create-sheet";
import FavoritesSheet from "./favorites-sheet";
import DownloadsSheet from "./downloads-sheet";
import AlertsSheet from "./alerts-sheet";
import MoreSheet from "./more-sheet";
import EditSheet from "./edit-sheet";

export type SheetId = "edit" | "create" | "favorites" | "downloads" | "alerts" | "more";

export const SHEET_REGISTRY: Record<SheetId, { label: string; component: React.ComponentType }> = {
  edit: { label: "Edit", component: EditSheet },
  create: { label: "Create", component: CreateSheet },
favorites: { label: "Vault", component: FavoritesSheet },
  downloads: { label: "Downloads", component: DownloadsSheet },
  alerts: { label: "Alerts", component: AlertsSheet },
  more: { label: "More", component: MoreSheet },
};

// order of swipe — edit first so dots match cubes
export const SHEET_ORDER: SheetId[] = ["edit", "create", "favorites", "downloads", "alerts", "more"];
