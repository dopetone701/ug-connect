"use client";
import MoviesTopBar from "./movies-top-bar";
export default function UniversalTopBar(){
  // Launch mode fallback - returns movies top bar
  // When UNIVERSAL_ENABLED=true, build universal header here
  return <MoviesTopBar />;
}

