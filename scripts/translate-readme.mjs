// Übersetzt README.md (Englisch = Standard) mit einem OpenAI-kompatiblen
// Endpunkt in die weiteren UI-Sprachen. Läuft im GitHub-Action-Workflow
// „Translate README"; der Schlüssel kommt aus dem Repo-Secret TRANSLATE_API_KEY.
import { readFile, writeFile } from "node:fs/promises";

const SOURCE = "README.md";
const TARGETS = [
  { code: "de", file: "README.de.md", name: "Deutsch" },
  { code: "fr", file: "README.fr.md", name: "Français" },
  { code: "es", file: "README.es.md", name: "Español" },
  { code: "ru", file: "README.ru.md", name: "Русский" },
];

const key = process.env.TRANSLATE_API_KEY;
const base = (process.env.TRANSLATE_API_BASE || "https://api.deepseek.com").replace(/\/$/, "");
const model = process.env.TRANSLATE_MODEL || "deepseek-chat";

if (!key) {
  console.error("TRANSLATE_API_KEY is missing (set it as a repository secret).");
  process.exit(1);
}

const source = await readFile(SOURCE, "utf8");

async function translate(text, language) {
  const response = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            `Translate this README from English into ${language}. ` +
            "Keep Markdown syntax, HTML, links, image paths, code blocks, command names and URLs unchanged. " +
            "Return only the translated Markdown, without any preface.",
        },
        { role: "user", content: text },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`translation request failed: ${response.status} ${await response.text()}`);
  }
  const payload = await response.json();
  const translated = payload?.choices?.[0]?.message?.content?.trim();
  if (!translated) {
    throw new Error("translation response was empty");
  }
  return translated;
}

for (const target of TARGETS) {
  const translated = await translate(source, target.name);
  const banner = `> Machine-translated from [README.md](README.md) into ${target.name} — corrections welcome.\n\n`;
  await writeFile(target.file, `${banner}${translated}\n`, "utf8");
  console.log(`wrote ${target.file}`);
}
