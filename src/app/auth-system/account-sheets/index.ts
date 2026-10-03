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

// full order - used for logged in
export const BASE_SHEET_ORDER: SheetId[] = ["edit", "subscriptions", "favorites", "downloads", "alerts", "more"];

// backward compat
export const SHEET_ORDER: SheetId[] = BASE_SHEET_ORDER;

// helper - returns visible sheets based on guest status
export const getVisibleSheetOrder = (): SheetId[] => {
  try {
    const raw = localStorage.getItem("ug_user");
    const token = localStorage.getItem("ug_token");
    const guestFlag = localStorage.getItem("ug_guest") === "1";
    let isGuest = !token || guestFlag;
    if (raw) {
      const u = JSON.parse(raw);
      if (u?.isGuest) isGuest = true;
    }
    if (isGuest) {
      return BASE_SHEET_ORDER.filter((id) => id !== "edit");
    }
  } catch {}
  return BASE_SHEET_ORDER;
};

