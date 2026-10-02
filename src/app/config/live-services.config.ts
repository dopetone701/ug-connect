'use client';

import { create } from 'zustand';

export const ADMIN_EMAIL = 'connectu89@gmail.com';

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

// --- ADMIN CHECK ---
export function isAdminUser(user: any): boolean {
  if (!user?.email) return false;
  return user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

// --- CORE LOGIC ---
// public = only live:true (movies), admin = all services
export function getVisibleServices(user: any, allServices: Service[] = SERVICES): Service[] {
  if (isAdminUser(user)) return allServices; // admin sees all for background editing
  return allServices.filter(s => s.live); // public sees only movies for now
}

type ServicesStore = {
  services: Service[];
  liveServices: Service[];
  getLiveServices: (user?: any) => Service[];
  getVisibleServices: (user?: any) => Service[];
  setLive: (id: Service['id'], live: boolean) => void;
  toggleLive: (id: Service['id']) => void;
  isAdmin: (user: any) => boolean;
}

export const useServicesStore = create<ServicesStore>((set, get) => ({
  services: SERVICES,
 
  // auto-computed - public live only
  get liveServices() {
    return get().services.filter((s) => s.live);
  },

  // NEW: respects admin
  getLiveServices: (user?: any) => {
    const services = get().services;
    if (user && isAdminUser(user)) return services;
    return services.filter((s) => s.live);
  },

  // NEW: main function to use in page.tsx
  getVisibleServices: (user?: any) => {
    return getVisibleServices(user, get().services);
  },

  isAdmin: (user: any) => isAdminUser(user),

  setLive: (id, live) => set((state) => ({
    services: state.services.map((s) => s.id === id ? { ...s, live } : s)
  })),

  toggleLive: (id) => set((state) => ({
    services: state.services.map((s) => s.id === id ? { ...s, live: !s.live } : s)
  })),
}));

// keep this for non-react files
export const getLiveServices = (user?: any) => {
  if (user && isAdminUser(user)) return SERVICES;
  return SERVICES.filter((s: Service) => s.live);
};

// Hook for page.tsx
export function useVisibleServices() {
  const { services } = useServicesStore();
  // sync user from localStorage
  if (typeof window === 'undefined') return services.filter(s => s.live);
  try {
    const s = localStorage.getItem("ug_user");
    const user = s ? JSON.parse(s) : null;
    return getVisibleServices(user, services);
  } catch {
    return services.filter(s => s.live);
  }
}

