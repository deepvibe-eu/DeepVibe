import { cn } from "@/components/lib/utils.js";
import whaleUrl from "@/assets/brand/deepseek-whale-white.png";

/**
 * DeepVibe-Marke für Welcome/Onboarding: der DeepSeek-Wal (weiß) als reiner Marker.
 * Er sitzt jeweils in einer eigenen dunklen Tile-Fläche, deshalb hier ohne Hintergrund.
 */
export function ZCodeAboutLogo({ className }: { className?: string }) {
  return (
    <img
      src={whaleUrl}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={cn("shrink-0 select-none", className)}
    />
  );
}
