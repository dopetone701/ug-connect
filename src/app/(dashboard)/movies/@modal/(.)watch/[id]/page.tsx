export const runtime = 'edge';


import WatchClient from "../../../watch/[id]/watch-client";

export default function WatchModal() {
  return (
    <div className="yt-overlay-root">
      <WatchClient isOverlay={true} />
    </div>
  );
}
