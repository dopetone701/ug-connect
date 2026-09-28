'use client';

import { create } from 'zustand';

export type Service = {
  id: 'movies' | 'mobile-money' | 'transporters' | 'beds' | 'saloons' | 'jobs' | 'ug-foods';
  name: string;
  live: boolean;
  shortDesc: string;
}

export const SERVICES: Service[] = [
  { id: 'movies', name: 'Movies', live: true, shortDesc: 'Ugandan movies & entertainment for fun' },
  { id: 'mobile-money', name: 'Mobile Money Bike', live: false, shortDesc: 'Link to boda mobile money dealers' },
  { id: 'transporters', name: 'Transporters', live: false, shortDesc: 'Send packages Uganda <-> abroad' },
  { id: 'beds', name: 'Beds Near U', live: false, shortDesc: 'Bed spaces close to you' },
  { id: 'ug-foods', name: 'UG Foods', live: false, shortDesc: 'Ugandan food delivery' },
  { id: 'saloons', name: 'Saloons', live: false, shortDesc: 'Saloon services' },
  { id: 'jobs', name: 'Jobs', live: false, shortDesc: 'Jobs for Ugandans abroad' },
];

type ServicesStore = {
  services: Service[];
  liveServices: Service[];
  getLiveServices: () => Service[];
  setLive: (id: Service['id'], live: boolean) => void;
  toggleLive: (id: Service['id']) => void;
}

export const useServicesStore = create<ServicesStore>((set, get) => ({
  services: SERVICES,
  
  // auto-computed
  get liveServices() {
    return get().services.filter((s) => s.live);
  },

  getLiveServices: () => {
    return get().services.filter((s) => s.live);
  },

  setLive: (id, live) => set((state) => ({
    services: state.services.map((s) => s.id === id ? { ...s, live } : s)
  })),

  toggleLive: (id) => set((state) => ({
    services: state.services.map((s) => s.id === id ? { ...s, live: !s.live } : s)
  })),
}));

// keep this for non-react files like your old faq.data.ts
export const getLiveServices = () => SERVICES.filter((s: Service) => s.live);
