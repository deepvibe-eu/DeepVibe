import { cn } from "@/components/lib/utils.js";
import { ABOUT_MARK_URL as whaleUrl } from "@/assets/brand/index.js";

/**
 * Vibe-Marke für Welcome/Onboarding: der Flavor-spezifische Marker.
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
