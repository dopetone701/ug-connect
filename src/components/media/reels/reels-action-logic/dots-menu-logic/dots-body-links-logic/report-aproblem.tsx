"use client"
import { useRouter } from "next/navigation"
import { useDotsPanel } from "@/stores/use-dots-panel"
import { IconReport } from "./icons-launcher"

type Props = { movieId: string; movie?: any; onClose?: () => void }

export function ReportProblemItem({ movieId, onClose }: Props) {
  const router = useRouter()
  const { close } = useDotsPanel()
  const handle = () => {
    onClose?.(); close()
    setTimeout(()=> router.push(`/report?movieId=${movieId}&type=reel`), 150)
  }
  return (
    <button className="dots-item" onClick={handle}>
      <span className="dots-icon"><IconReport /></span>
      <span className="dots-text">
        <span className="dots-title">Find support or report movie</span>
        <span className="dots-sub">I'm concerned about this movie.</span>
      </span>
    </button>
  )
}
export default ReportProblemItem

