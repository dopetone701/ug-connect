import FavoritesSheet from "./favorites-sheet";
import DownloadsSheet from "./downloads-sheet";
import AlertsSheet from "./alerts-sheet";
import MoreSheet from "./more-sheet";
import EditSheet from "./edit-sheet";
import SubscriptionsSheet from "./subscriptions-sheet";


export type SheetId = "edit" | "subscriptions" | "favorites" | "downloads" | "alerts" | "more";

export const SHEET_REGISTRY: Record<SheetId, { label: string; component: React.ComponentType }> = {
  edit: { label: "Edit", component: EditSheet },
  subscriptions: { label: "Subscriptions", component: SubscriptionsSheet },
  favorites: { label: "Library", component: FavoritesSheet },
  downloads: { label: "Downloads", component: DownloadsSheet },
  alerts: { label: "Alerts", component: AlertsSheet },
  more: { label: "More", component: MoreSheet },
};

// order of swipe — edit first so dots match cubes
export const SHEET_ORDER: SheetId[] = ["edit", "subscriptions", "favorites", "downloads", "alerts", "more"];
