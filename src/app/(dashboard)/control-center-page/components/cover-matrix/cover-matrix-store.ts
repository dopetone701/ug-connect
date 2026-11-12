"use client";
import { create } from "zustand";

type View = "movies" | "covers";
type State = {
  isOpen: boolean;
  selectedMovieId: string | null;
  view: View;
  openPanel: (movieId?: string | null) => void;
  closePanel: () => void;
  selectMovie: (id: string) => void;
  backToMovies: () => void;
};

export const useCoverMatrixPanel = create<State>()((set) => ({
  isOpen: false,
  selectedMovieId: null,
  view: "movies",
  openPanel: (movieId) => set({ isOpen: true, selectedMovieId: movieId ?? null, view: movieId ? "covers" : "movies" }),
  closePanel: () => set({ isOpen: false }),
  selectMovie: (id) => set({ selectedMovieId: id, view: "covers" }),
  backToMovies: () => set({ view: "movies", selectedMovieId: null }),
}));

