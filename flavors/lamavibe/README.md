# LamaVibe

<div align="center">
  <img src="packages/desktop/build/README-images/LamaVibe_ru.png" alt="LamaVibe screenshot" width="auto" />
</div>

<p align="center">
  <a href="https://deepvibe.eu/lamavibe">lamavibe.eu</a>
</p>

LamaVibe is the **Ollama build** of the _Vibe_ family — a fork of ZCode focused on a single provider: **Ollama** (local models). One model, one workspace, a partner — not an agent.

The _Vibe_ family ships one focused app per provider (DeepVibe for DeepSeek, KimiVibe for Kimi, LamaVibe for Ollama, MiniVibe for MiniMax, KlausVibe for Claude, …), each with its own character. It exists **alongside** ZCode, not instead of it: ZCode for the multi-provider workflow, the Vibe apps for people who want one model, one workspace, one partner. See the main source repository for the full codebase.

## Downloads

Installers for macOS, Windows and Linux are published under [Releases](../../releases). The built-in updater checks this repository.

## Building from source

Requires Git, Node.js **24.14.0** and pnpm **10.33.2** (see `mise.toml`).

```bash
pnpm bootstrap
# run the LamaVibe flavor in dev
pnpm dev:desktop:lama
# package (LamaVibe flavor)
ZCODE_LAMA_IDENTITY=1 pnpm bundle:desktop -- --os linux --arch x64
```

## Using local models

LamaVibe talks to your local [Ollama](https://ollama.com) server at `http://localhost:11434/v1`. The built-in **Ollama (Local)** provider needs **no API key**.

1. Make sure Ollama is running and you have at least one chat model, e.g. `ollama pull qwen2.5-coder:7b`.
2. Open **Settings → Model providers → Ollama (Local) → Add model**.
3. Click **Load models** to list the models installed on your machine and pick one (or type the model ID).
4. Keep the API format at **OpenAI-compatible (chat completions)**.

**Tool calls:** Under *Advanced → Capabilities* you will find a **Tool calls** switch. It is **off by default for local providers**, because most local models either do not support function calling or expose it differently. Only switch it on if your model really supports Ollama tool calls — otherwise Ollama rejects the request with HTTP 400 `does not support tools`. For plain chat, leave it off.

**Embedding models** such as `nomic-embed-*` are meant for memory and semantic search (embeddings), not for chatting — pick a chat model for a thread.

## License & attribution

Built on ZCode (Apache-2.0); the license and NOTICE are preserved. LamaVibe is an independent project and is not affiliated with ZCode/Z.ai or Ollama. Ollama is a trademark of its owner; the logo is used with the operator's permission.
