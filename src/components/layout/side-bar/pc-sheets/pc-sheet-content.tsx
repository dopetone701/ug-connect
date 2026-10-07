"use client";
import { SheetId } from "@/stores/use-side-sheet";
import InviteSheet from "../sheets/invite-sheet";
import SubscriptionSheet from "../sheets/subscription-sheet";
import AccountSheet from "../sheets/account-sheet";
import CastSheet from "../sheets/cast-sheet";
import ListsSheet from "../sheets/lists-sheet";
import PrivacySheet from "../sheets/privacy-sheet";
import TipsSheet from "../sheets/tips-sheet";
import ControlSheet from "../sheets/control-sheet";

export default function PcSheetContent({ id }: { id: SheetId }) {
  // REUSE SAME MOBILE SHEETS - no duplication - each keeps own sync
  switch (id) {
    case "invite":
      return <InviteSheet />;
    case "subscription":
      return <SubscriptionSheet />;
    case "account":
      return <AccountSheet />;
    case "cast":
      return <CastSheet />;
    case "lists":
      return <ListsSheet />;
    case "privacy":
      return <PrivacySheet />;
    case "tips":
      return <TipsSheet />;
    case "control":
      return <ControlSheet />;
    default:
      return null;
  }
}

