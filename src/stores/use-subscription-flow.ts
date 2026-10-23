"use client";
import { create } from "zustand";

export type PaymentMethod = "mtn" | "airtel" | "paypal" | "card" | null;
export type FlowStep = "closed" | "method" | "payment" | "processing" | "success" | "failed";

type FlowState = {
  step: FlowStep;
  planId: string | null;
  method: PaymentMethod;
  open: (planId: string) => void;
  selectMethod: (m: PaymentMethod) => void;
  back: () => void;
  goProcessing: () => void;
  goSuccess: () => void;
  goFailed: () => void;
  closeAll: () => void;
};

export const useSubscriptionFlow = create<FlowState>((set) => ({
  step: "closed",
  planId: null,
  method: null,
  open: (planId) => set({ step: "method", planId, method: null }),
  selectMethod: (method) => set({ method, step: "payment" }),
  back: () => set((s) => {
    if (s.step === "payment") return { step: "method" } as any;
    if (s.step === "method") return { step: "closed", planId: null } as any;
    if (s.step === "processing") return { step: "payment" } as any;
    return s;
  }),
  goProcessing: () => set({ step: "processing" }),
  goSuccess: () => set({ step: "success" }),
  goFailed: () => set({ step: "failed" }),
  closeAll: () => set({ step: "closed", planId: null, method: null }),
}));

