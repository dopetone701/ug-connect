import type { ComponentType } from "react";
import type { DrawerId, DrawerProps } from "./drawer.types";
import UserHubDrawer from "./user-hub-drawer";
import ConfirmActionDrawer from "./confirm-action-drawer";
import UserProfileMonitor from "./user-profile/user-profile-scope";
import UserActivityMonitor from "./user-profile/user-activity-monitor";
import UserEngagementMonitor from "./user-profile/user-engagement-monitor";

import { createPlaceholder } from "./drawer-placeholder";

// One line per drawer. Swap a placeholder for the real panel as each one gets built.
export const DRAWER_REGISTRY: Record<DrawerId, ComponentType<DrawerProps>> = {
  hub: UserHubDrawer,
  confirm: ConfirmActionDrawer,
  profile: UserProfileMonitor,
  activity: UserActivityMonitor,
  engagement: UserEngagementMonitor,
  subscription: createPlaceholder("Subscription", "Read-only plan and billing status."),
  security: createPlaceholder("Security", "OTP status, sessions, login history."),
  mail: createPlaceholder("Send mail", "Personal mail to this account."),
  verification: createPlaceholder("Verification", "Verified status and OTP history."),
  reports: createPlaceholder("Reports", "Report count with a link to the Reports module."),
};
