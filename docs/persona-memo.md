# Persona-Memo (Spec)

Status: umgesetzt 2026-10-21.

## Ziel

Eine kurze Stil-/Charakter-Notiz, die den **Ton und die Arbeitsweise** des Begleiters beschreibt und
eine **Kontext-Kompression überlebt**. Die Kompression fasst die Gesprächshistorie zusammen; die
Persona-Notiz wird dagegen bei jedem Turn neu aus einer Datei geladen und bleibt dadurch erhalten.

## Ort & Format

- **User-global:** `<VIBE_DATA_DIR_NAME>/PERSONA.md` (DeepVibe: `~/.deepvibe/PERSONA.md`).
- Markdown, kurz (Richtwert ≤ 4 KB). Kein Gesprächsverlauf, keine Geheimnisse.
- Wird nur geladen, wenn die Datei existiert (sonst No-op).

## Verhalten

- Der Adapter-Resolver (`apps/zcode-cli/packages/adapters/src/context/index.ts`) nimmt `PERSONA.md`
  als **user-scope**-Quelle **vor** `AGENTS.md` in die User-Instruktionen auf.
- Dadurch erscheint das Memo im `agentsMd`-Kontext jedes Requests — auch nach einer Kompression.
- Reihenfolge: `PERSONA.md` → `~/.deepvibe/AGENTS.md` → Projekt-`AGENTS.md`.

## Abgrenzung

- Kein Ersatz für `AGENTS.md` (Regeln/Projektanweisungen) — das Memo ist **Stil/Charakter**.
- Die compile-time `VIBE_PERSONA` (Name/Produkt) bleibt unverändert; das Memo ergänzt sie.

## Akzeptanz

1. `~/.deepvibe/PERSONA.md` vorhanden → Inhalt ist in jedem Turn im User-Kontext enthalten.
2. Datei fehlt → kein Fehler, kein zusätzlicher Kontext.
3. Nach einer Compaction ist das Memo weiterhin im Prompt (weil pro Turn neu geladen).
