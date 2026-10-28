// edit-movie/lib/delete-r2.ts
import { WORKER_URL } from "../constants";

export async function deleteR2File(oldUrlOrKey: string | null | undefined): Promise<void> {
  if (!oldUrlOrKey) return;
  let key = oldUrlOrKey;
  if (key.includes("/r2/")) key = key.split("/r2/")[1];
  if (key.startsWith("http")) {
    try {
      key = decodeURIComponent(new URL(key).pathname.replace("/r2/", "").replace(/^\/+/, ""));
    } catch {}
  }
  if (!key || key.includes("blob:") || key === "/movie.jpg") return;
  
  try {
    await fetch(`${WORKER_URL}/r2-delete/${encodeURIComponent(key)}`, { method: "DELETE" });
    console.log("🗑️ Deleted:", key);
  } catch (e) {
    console.warn("Failed delete:", key, e);
  }
}