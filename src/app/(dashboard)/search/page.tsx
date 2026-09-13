"use client";
import SearchDrawer from "@/components/layout/top-bar/search-drawer";
import { useGlobalSearch } from "@/stores/use-global-search";

export default function SearchPage() {
  return (
    <div style={{paddingTop:"70px"}}>
      <SearchDrawer />
    </div>
  );
}
