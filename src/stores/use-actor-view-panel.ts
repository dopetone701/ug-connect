"use client"
import { create } from "zustand"

type ActorForPanel = {
  actorId?: string | null
  name: string
  photo: string | null
}

type ActorViewPanelState = {
  isOpen: boolean
  actorId: string | null
  actor: ActorForPanel | null
  open: (actor: ActorForPanel) => void
  close: () => void
}

export const useActorViewPanel = create<ActorViewPanelState>((set) => ({
  isOpen: false,
  actorId: null,
  actor: null,
  open: (actor) => set({
    isOpen: true,
    actorId: actor.actorId || actor.name,
    actor,
  }),
  close: () => set({ isOpen: false, actorId: null, actor: null }),
}))
