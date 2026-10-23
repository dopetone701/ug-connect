"use client";
import { create } from "zustand";
import { getSubscriptionStatus } from "@/lib/billing/billing-api";

type SubState = {
  isPremium: boolean;
  subscription: any;
  loading: boolean;
  checkStatus: (deviceId: string) => Promise<void>;
};

export const useSubscriptionStore = create<SubState>((set) => ({
  isPremium: false,
  subscription: null,
  loading: false,
  checkStatus: async (deviceId: string) => {
    set({ loading: true });
    try {
      const data = await getSubscriptionStatus(deviceId);
      set({
        isPremium: data?.isPremium || data?.active || false,
        subscription: data?.subscription || data,
        loading: false
      });
    } catch {
      set({ isPremium: false, loading: false });
    }
  }
}));

