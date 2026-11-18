// src/app/(dashboard)/control-center-page/components/entity-arsenal/save-arsenal-item.ts
// FROM SCRATCH - POST /arsenal/items only. NEVER POSTs to /movies.

import { ARSENAL_ENDPOINTS } from "./arsenal-constants";
import type { ArsenalItem, ArsenalType } from "./arsenal-types";

export interface SaveArsenalItemInput {
  uploaderEmail: string;
  titleHint: string;
  type: ArsenalType;
  /** Single only */
  arsenalKey?: string;
  /** Series only */
  episodes?: Array<{ episodeNumber: number; title: string; arsenalKey: string; fileSize?: number | null; mime?: string }>;
  fileSize?: number | null;
  mime?: string;
}

export async function saveArsenalItem(input: SaveArsenalItemInput): Promise<{ success: boolean; id: string }> {
  const res = await fetch(ARSENAL_ENDPOINTS.items, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      uploaderEmail: input.uploaderEmail.trim().toLowerCase(),
      titleHint: input.titleHint,
      type: input.type,
      arsenalKey: input.arsenalKey || "",
      episodes: input.episodes || [],
      fileSize: input.fileSize ?? null,
      mime: input.mime || "",
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Save arsenal item failed: ${res.status}`);
  return data;
}

export async function listArsenalItems(): Promise<ArsenalItem[]> {
  const res = await fetch(ARSENAL_ENDPOINTS.items, { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `List arsenal failed: ${res.status}`);
  return (data.items || []) as ArsenalItem[];
}

export async function getArsenalItem(id: string): Promise<ArsenalItem> {
  const res = await fetch(`${ARSENAL_ENDPOINTS.items}/${encodeURIComponent(id)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Get arsenal item failed: ${res.status}`);
  return data.item as ArsenalItem;
}

