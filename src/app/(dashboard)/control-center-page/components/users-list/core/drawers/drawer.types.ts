export type DrawerId =
  | "hub"
  | "profile"
  | "activity"
  | "engagement"
  | "subscription"
  | "security"
  | "mail"
  | "verification"
  | "reports"
  | "confirm";

export type ConfirmAction = "terminate" | "delete";

export type DrawerProps = {
  userId: string;
  action?: ConfirmAction;
};

export type DrawerEntry = {
  id: DrawerId;
  props: DrawerProps;
};

