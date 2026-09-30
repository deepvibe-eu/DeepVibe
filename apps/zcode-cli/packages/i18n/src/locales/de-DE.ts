import type { ZCodeCopy } from "../types.js";

export const deDE: ZCodeCopy = {
  locale: "de-DE",
  cli: {
    errors: {
      localeUnsupported: (value) =>
        `Nicht unterstützter Wert für --locale: ${value}. Unterstützte Sprachen: en-US, zh-CN, auto.`,
    },
    help: (version) => `zcode ${version}

Verwendung:
  zcode [command] [options]

Ohne Befehl öffnet zcode die Vollbild-TUI.

Befehle:
  app-server DeepVibe Protocol stdio-App-Server ausführen
  commands   Benutzerdefinierte Slash-Befehle auflisten (\`commands list\`)
  doctor     Laufzeit- und Paketierungsannahmen prüfen
  login [zai|bigmodel]  Über Browser-Autorisierung anmelden
  logout     Gemeinsame Z.AI-Anmeldedaten entfernen
  plugins    Plugins und Marketplaces verwalten (\`plugins list|install|uninstall|enable|disable|update|validate|marketplace ...\`; Alias: plugin)
  skills     Lokale Skills auflisten (\`skills list\`)
  tui        Terminal-UI öffnen
  version    CLI-Version ausgeben

Optionen:
  -h, --help       Hilfe anzeigen
  -v, --version    Version anzeigen
  -p, --prompt <text>  Einen einzelnen Prompt ausführen, ohne die TUI zu öffnen
  --enable-workflow  Dynamische Workflows für --prompt oder --target aktivieren (Standard: aus)
  --memory-bench   Mit --prompt die automatische Memory-Extraktion aktivieren und vor dem Beenden warten (erfordert aktiviertes Memory)
  --browser-use <mode> Browser-Use-Backend aktivieren (unterstützt: headless)
  --surface <surface>  Darstellungsfläche für Headless-Prompts/App-Server: terminal oder desktop
  --browser-executable <path> Chrome/Chromium-Programm für Headless Browser Use
  --attach <path>  Eine lokale Datei an --prompt anhängen; für mehrere Dateien wiederholen
  --cwd <path>     Diesen Befehl aus dem angegebenen Verzeichnis ausführen
  --disallowed-tools, --disallowedTools <tools...>
    Ganze Tools nur für diesen Prompt/TUI-Lauf entfernen; gespeicherte Einstellungen bleiben unverändert.
    Durch Komma oder Leerzeichen getrennte Toolnamen, z. B. "Bash Edit".
    "Bash(git *)" entfernt ganz Bash; Befehlsmuster werden nicht abgeglichen.
  --force-mcs      Mid-Conversation-Systemprojektion für Anthropic-Anbieter erzwingen
  --locale <locale>  UI-Sprache: en-US, zh-CN oder auto
  --mode <mode>    Berechtigungsmodus für Prompts: build, edit, plan oder yolo (Standard: yolo für --prompt)
  --resume <sessionId>  Eine gespeicherte Sitzung per sessionId fortsetzen (sess_...)
  --target <text>  Das Sitzungsziel im Headless-Modus ausführen oder festlegen
  --target-replace Ein vorhandenes, von --target gesetztes Sitzungsziel ersetzen
  -c, --continue        Die neueste Sitzung für das aktuelle Verzeichnis fortsetzen
  --json           Maschinenlesbares JSON ausgeben, wo unterstützt
  --no-browser     Die OAuth-URL ausgeben, ohne einen Browser zu öffnen
  --no-color       ANSI-Farben deaktivieren
  --verbose        Zusätzliche Diagnosedetails ausgeben

Slash-Befehle:
  /help [command]       Hilfe zu Slash-Befehlen anzeigen
  /login                Z.AI- oder BigModel-Browseranmeldung wählen
  /logout               Gemeinsame Z.AI-Anmeldedaten entfernen
  /compact [instructions]  Die aktuelle Konversation verdichten
  /expert [status|resume|stop|<task>]  Den Expert-Workflow ausführen oder verwalten
  /dwf [list|cancel|resume]  Dynamische Workflow-Runs auflisten, abbrechen oder fortsetzen
  /fork [latest|checkpointId]  Eine neue Sitzung von einem Arbeitsbereich-Checkpoint abzweigen
  /mcp [list|status|connect|disconnect]  MCP-Server anzeigen oder verwalten
  /mode [mode]          Berechtigungsmodus anzeigen oder wechseln: build, edit, plan oder yolo
  /model [id]           Das Modell der aktuellen Sitzung anzeigen oder wechseln
  /new                  Eine neue Sitzung in der TUI starten
  /resume [sessionId]   Eine Sitzung per sessionId fortsetzen; weglassen für die neueste im cwd
  /rewind [latest|checkpointId]  Neuesten Checkpoint anzeigen oder Arbeitsbereichsdateien wiederherstellen
  /skill [name] [task]  Skills auflisten oder den nächsten Prompt zwingen, einen zu laden
  /goal [action]        Das aktuelle Sitzungsziel anzeigen oder festlegen
`,
  },
  tui: {
    copy: {
      copied: "Ausgewählter Text in die Zwischenablage kopiert.",
      failed: "Ausgewählter Text konnte nicht kopiert werden.",
      unavailable: "Das Kopieren von Text in die Zwischenablage ist in diesem Terminal nicht verfügbar.",
    },
    effort: {
      disabled: "deaktiviert",
      enabled: "aktiviert",
    },
    input: {
      activeStatusHint: "Esc zum Unterbrechen",
      busyPlaceholder: "Tippen, um Eingaben einzureihen",
      placeholder: "Prompt eingeben",
      queuedMore: (count) => `+ ${count} weitere in der Warteschlange`,
      queuedSubmitHint: "Wird nach dem nächsten Tool-Aufruf gesendet.",
      queuedTitle: (count) => ` Warteschlange (${count}) `,
      title: "Eingabe",
      noHistorySource: "Keine Quelle für den Eingabeverlauf konfiguriert.",
      noPreviousInput: "Keine vorherige Eingabe für dieses Projekt.",
      restoredPreviousInput: "Vorherige Eingabe wiederhergestellt.",
      restoredPreviousInputWithAttachments: (count) =>
        `Vorherige Eingabe mit ${count} Anhängen wiederhergestellt.`,
      restorePreviousInputFailed: "Vorherige Eingabe konnte nicht wiederhergestellt werden.",
      typePrompt: "Frage eingeben und Enter drücken.",
    },
    loginRequired: {
      help: "Mit /model Modelle anzeigen oder mit /login ein Coding-Plan-Konto verbinden.",
      message: "Keine Modelle verfügbar. Konfiguriere einen Anbieter oder melde dich mit /login an.",
      status: "Keine Modelle verfügbar. Konfiguriere einen Anbieter oder melde dich mit /login an.",
      title: "Modelleinrichtung erforderlich",
    },
    loginSetup: {
      emptyMessage: "Keine Anmeldeoptionen verfügbar.",
      help: "Mit Auf/Ab auswählen, Enter bestätigt.",
      options: {
        bigmodelApiKey: {
          inputPrimary: "BigModel Coding Plan API-Schlüssel eingeben",
          inputSecondary: "Füge den Schlüssel hier ein. Er wird beim Tippen ausgeblendet.",
          primary: "BigModel Coding Plan API-Schlüssel",
          secondary: "Einen Coding-Plan-API-Schlüssel manuell einfügen.",
        },
        bigmodelOauth: {
          pendingPrimary: "Warten auf BigModel-Autorisierung",
          pendingSecondary:
            "Schließe die Anmeldung in deinem Browser ab. Die Autorisierung wird automatisch erkannt.",
          primary: "BigModel Coding Plan",
          secondary: "Browseranmeldung öffnen; die Autorisierung wird automatisch erkannt.",
        },
        zaiApiKey: {
          inputPrimary: "Z.AI Coding Plan API-Schlüssel eingeben",
          inputSecondary: "Füge den Schlüssel hier ein. Er wird beim Tippen ausgeblendet.",
          primary: "Z.AI Coding Plan API-Schlüssel",
          secondary: "Einen Coding-Plan-API-Schlüssel manuell einfügen.",
        },
        zaiOauth: {
          pendingPrimary: "Warten auf Z.AI-Autorisierung",
          pendingSecondary:
            "Schließe die Anmeldung in deinem Browser ab. Ich fahre fort, sobald die Autorisierung abgeschlossen ist.",
          primary: "Z.AI Coding Plan",
          secondary: "Browseranmeldung öffnen und einen Coding-Plan-API-Schlüssel erstellen.",
        },
      },
      pending: {
        cancelStatus: "Anmeldung abgebrochen. Wähle eine Einrichtungsmethode.",
        help: "Esc bricht ab und kehrt zur Auswahl zurück.",
        status: "Warten auf Browser-Autorisierung...",
      },
      input: {
        cancelStatus: "API-Schlüssel-Eingabe abgebrochen. Wähle eine Einrichtungsmethode.",
        clearStatus: "API-Schlüssel-Eingabe geleert.",
        emptyStatus: "API-Schlüssel ist erforderlich.",
        help: "Enter speichert den Schlüssel. Esc kehrt zur Auswahl zurück.",
        placeholder: "API-Schlüssel einfügen",
        status: "Gib den API-Schlüssel ein und drücke dann Enter.",
        submitStatus: "API-Schlüssel wird gespeichert...",
      },
      prompt: "Wähle eine Anmelde- oder API-Schlüssel-Einrichtung.",
      response: "Wähle, wie ein Coding-Plan-Anbieter eingerichtet wird.",
      title: "Coding Plan einrichten",
    },
    model: {
      requestFailed: (message) => `Modellanfrage fehlgeschlagen: ${message}`,
      responseReceived: "Modellantwort empfangen.",
      responseReceivedWithTokens: (tokens) => `Modellantwort empfangen. ${tokens} Tokens.`,
      retryScheduled: ({ attempt, delay, maxAttempts, reason }) =>
        `Modellanfrage wird erneut versucht ${attempt}/${Math.max(1, maxAttempts - 1)} in ${delay}: ${reason}`,
      streamStalled: "Modellstream stockt.",
    },
    sidebar: {
      subagents: {
        title: "Subagenten",
        empty: "Noch keine Subagenten.",
        emptyOutput: "Noch keine Ausgabe.",
        back: "← Hauptkonversation",
        readonly: "Schreibgeschützt · Esc zum Zurückgehen",
        loading: "Subagent-Ausgabe wird geladen...",
        unavailable: "Subagent-Ausgabe nicht verfügbar.",
        retry: "Erneut versuchen",
        more: "Mehr laden",
        pendingMain: "Die Hauptkonversation braucht deine Eingabe – kehre zurück, um zu antworten",
        ended: (count) => `Beendet (${count})`,
        status: {
          running: "läuft",
          waiting: "wartet",
          blocked: "blockiert",
          success: "abgeschlossen",
          failed: "fehlgeschlagen",
          cancelled: "abgebrochen",
          lost: "verloren",
        },
      },
      api: {
        empty: "Noch keine API-Aufrufe.",
        model: "Modell",
        more: (count) => `+${count} weitere`,
        requests: "Anfragen",
        server: "Server",
      },
      cache: {
        hit: "Treffer",
        lastHit: "letzter Treffer",
        lastMiss: "letzter Fehlschlag",
        readWrite: ({ read, write }) => `${read} gelesen / ${write} geschrieben`,
        total: "gesamt",
      },
      context: {
        cache: "Cache",
        cacheReadWrite: "Cache R/W",
        inputOutput: "I/O",
        reason: "Denken",
        tokens: "Tokens",
        used: "Genutzt",
        window: "Fenster",
      },
      modifiedFiles: {
        empty: "Noch keine Dateiänderungen.",
        more: (count) => `+${count} weitere`,
      },
      mcp: {
        empty: "Keine MCP-Server konfiguriert.",
        loadFailed: "MCP-Status nicht verfügbar.",
        loading: "MCP-Status wird geladen...",
        more: (count) => `+${count} weitere`,
        servers: "Server",
        status: {
          connected: "verbunden",
          connecting: "verbindet",
          disabled: "deaktiviert",
          disconnected: "getrennt",
          failed: "fehlgeschlagen",
          untrusted: "nicht vertrauenswürdig",
        },
        summary: ({ connected, total }) => `${connected}/${total} verbunden`,
        tools: (count) => `${count} ${count === 1 ? "Tool" : "Tools"}`,
      },
      request: {
        complete: "abgeschlossen",
        error: "Fehler",
        errorWithStatus: (statusCode) => `Fehler ${statusCode}`,
        pending: "ausstehend",
      },
      status: {
        last: "Zuletzt",
      },
      run: {
        draft: "Entwurf",
        draftChars: (count) => `${count} Zeichen`,
        draftEmpty: "leer",
        messages: "Nachrichten",
        mode: "Modus",
        model: "Modell",
        provider: "Anbieter",
        thought: "Gedanke",
        trace: "Ablauf",
        turn: "Runde",
        workspace: "Arbeitsbereich",
      },
      sections: {
        apis: "APIs",
        context: "Kontext",
        mcp: "MCP",
        modifiedFiles: "Geänderte Dateien",
        run: "Run",
        status: "Status",
        todos: "Aufgaben",
      },
      shellSubtitle: "OpenTUI-Shell",
      title: "Seitenleiste",
      todos: {
        empty: "Noch keine Aufgaben.",
        more: (count) => `+${count} weitere`,
        progress: "Fortschritt",
      },
    },
    status: {
      compactFailed: "Kontextkomprimierung fehlgeschlagen.",
      compacted: "Konversation verdichtet.",
      compacting: "Kontext wird komprimiert...",
      interruptedStreamDiscarded: "Unterbrochener Modellstream verworfen.",
      modelCalling: "Modell wird aufgerufen...",
      permissionRequested: (toolName) => `Berechtigung für ${toolName} angefragt.`,
      permissionResolved: (toolName) => `Berechtigung für ${toolName} geklärt.`,
      ready: "Bereit.",
      recoveringStream: "Unterbrochener Modellstream wird wiederhergestellt...",
      retryingStream: "Modellstream wird erneut versucht...",
      sessionResumed: "Sitzung fortgesetzt.",
      targetChanged: (action) => `Ziel ${action}.`,
      thinking: "Denke nach...",
      toolCompleted: (toolName) => `Tool ${toolName} abgeschlossen.`,
      toolFailed: (toolName) => `Tool ${toolName} fehlgeschlagen.`,
      toolPending: (toolName) => `Tool ${toolName} ausstehend.`,
      toolRunning: (toolName) => `Tool ${toolName} läuft.`,
      turnFailed: "Runde fehlgeschlagen.",
    },
    terminal: {
      requiresInteractive: "Die TUI benötigt ein interaktives Terminal.",
      starting: "DeepVibe wird gestartet... Strg+C zum Beenden",
    },
    transcript: {
      compact: {
        completed: "Kontext komprimiert",
        failed: "Kontextkomprimierung fehlgeschlagen",
        interrupted: "Kontextkomprimierung unterbrochen",
        retry: (command) => `Strg+R für einen neuen Versuch: ${command}`,
        retrying: ({ attempt, maxAttempts }) =>
          maxAttempts > 0
            ? `Wiederhole Kontextkomprimierung (${attempt}/${maxAttempts})`
            : "Kontextkomprimierung wird wiederholt",
        skipped: "Kontext ist aktuell; keine Komprimierung nötig",
        started: "Kontext wird komprimiert",
      },
      roles: {
        agent: "Agent",
        system: "System",
        user: "Nutzer",
      },
      thought: {
        complete: "Gedanke",
        thinking: "Denke nach...",
      },
      title: "Verlauf",
      workflow: {
        actors: "Akteure:",
        actorRow: ({ name, status }) => `${name} - ${status}`,
        usage: ({ spentTokens }) => `Verbrauch: ${spentTokens} Tokens`,
        collapsed: ({ label, status, nodesSettled, nodesTotal }) =>
          `Workflow ${label} - ${status} (${nodesSettled}/${nodesTotal} Schritte)`,
        error: (message) => `Fehler: ${message}`,
        expandHint: "+ zum Ausklappen",
        collapseHint: "- zum Einklappen",
        log: "Protokoll:",
        nodes: ({ nodesSettled, nodesTotal }) => `${nodesSettled}/${nodesTotal} Schritte abgeschlossen`,
        result: (preview) => `Ergebnis: ${preview}`,
        status: {
          completed: "abgeschlossen",
          errored: "fehlerhaft",
          pending: "ausstehend",
          running: "läuft",
          stopped: "gestoppt",
        },
        stopReason: {
          user: "von dir",
          model: "durch den Agenten",
          provider: "Modellfehler",
          interrupted: "Prozess beendet",
          superseded: "durch einen geänderten Run ersetzt",
        },
        truncated: "(gekürzt – der vollständige Verlauf steht im Run-Journal)",
        interruptedNotice: ({ label, runId }) =>
          `Workflow ${label} wurde unterbrochen und kann fortgesetzt werden: /dwf resume ${runId}`,
      },
    },
    selection: {
      defaultHelp: "Enter wählt, Esc bricht ab",
      disabled: (reason) => ` [deaktiviert: ${reason}]`,
      filterLine: ({ filter, help }) =>
        `Filter: ${filter || "-"} | ${help ?? "Enter wählt, Esc bricht ab"}`,
      noFilter: "-",
    },
    fileMention: {
      empty: "Keine passenden Arbeitsbereichspfade.",
      loading: "Arbeitsbereichspfade werden geladen...",
      row: ({ path, selected }) => `${selected ? ">" : " "} ${path}`,
      title: "Dateien",
    },
    slash: {
      title: "Befehle",
      row: ({ name, selected, summary }) => `${selected ? ">" : " "} /${name}  ${summary}`,
    },
  },
};
