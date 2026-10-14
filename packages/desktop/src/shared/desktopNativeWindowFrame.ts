/**
 * Wayland-Sitzungserkennung für das native Fenster.
 *
 * Unter Linux/Wayland ist das frameless+transparente Fenster instabil (Ecken/Jitter beim Bewegen und
 * Resize), deshalb verwendet der main-Prozess dort `frame:true`. main und preload müssen dieselbe
 * Entscheidung treffen, sonst zeichnet der renderer weiterhin eigene Fensterknöpfe zusätzlich zur
 * nativen Dekoration.
 */
export function resolveHasNativeWindowFrame(input: {
  platform: string;
  env: Record<string, string | undefined>;
}): boolean {
  if (input.platform !== "linux") {
    return false;
  }
  return Boolean(input.env.WAYLAND_DISPLAY) || input.env.XDG_SESSION_TYPE === "wayland";
}
