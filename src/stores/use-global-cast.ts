"use client";
import { create } from "zustand";

export type Device = { 
  id: string; 
  name: string; 
  type: "tv" | "chromecast" | "airplay" 
};

type CastState = {
  isOpen: boolean;
  isScanning: boolean;
  isCasting: boolean;
  devices: Device[];
  selectedDevice: Device | null;
  setOpen: (v: boolean) => void;
  setScanning: (v: boolean) => void;
  setDevices: (d: Device[]) => void;
  selectDevice: (d: Device) => void;
  stopCasting: () => void;
};

export const useGlobalCast = create<CastState>((set) => ({
  isOpen: false,
  isScanning: false,
  isCasting: false,
  devices: [],
  selectedDevice: null,
  setOpen: (v) => set({ isOpen: v }),
  setScanning: (v) => set({ isScanning: v }),
  setDevices: (d) => set({ devices: d }),
  selectDevice: (d) => set({ selectedDevice: d, isCasting: true, isOpen: false }),
  stopCasting: () => set({ selectedDevice: null, isCasting: false }),
}));
