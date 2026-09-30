import type { ZCodeCopy } from "../types.js";

export const frFR: ZCodeCopy = {
  locale: "fr-FR",
  cli: {
    errors: {
      localeUnsupported: (value) =>
        `Valeur --locale non prise en charge : ${value}. Langues prises en charge : en-US, zh-CN, auto.`,
    },
    help: (version) => `zcode ${version}

Usage :
  zcode [command] [options]

Sans commande, zcode ouvre la TUI en plein écran.

Commandes :
  app-server Exécuter le serveur d’application stdio du protocole DeepVibe
  commands   Lister les commandes slash personnalisées (\`commands list\`)
  doctor     Inspecter les hypothèses d’exécution et de packaging
  login [zai|bigmodel]  Se connecter via l’autorisation dans le navigateur
  logout     Supprimer les identifiants de connexion Z.AI partagés
  plugins    Gérer les plugins et les places de marché (\`plugins list|install|uninstall|enable|disable|update|validate|marketplace ...\`; alias : plugin)
  skills     Lister les compétences locales (\`skills list\`)
  tui        Ouvrir l’interface terminal
  version    Afficher la version de la CLI

Options :
  -h, --help       Afficher l’aide
  -v, --version    Afficher la version
  -p, --prompt <text>  Exécuter un seul prompt sans ouvrir la TUI
  --enable-workflow  Activer les workflows dynamiques pour --prompt ou --target (par défaut : désactivé)
  --memory-bench   Avec --prompt, activer l’extraction automatique de la mémoire et attendre avant de quitter (nécessite la mémoire activée)
  --browser-use <mode> Activer le backend Browser Use (pris en charge : headless)
  --surface <surface>  Surface de présentation pour les prompts et app-server headless : terminal ou desktop
  --browser-executable <path> Exécutable Chrome/Chromium pour Browser Use en mode headless
  --attach <path>  Joindre un fichier local à --prompt ; répéter l’option pour plusieurs fichiers
  --cwd <path>     Exécuter cette commande depuis le répertoire indiqué
  --disallowed-tools, --disallowedTools <tools...>
    Retirer des outils entiers pour ce prompt ou cette exécution de la TUI uniquement ; les paramètres enregistrés ne sont pas modifiés.
    Noms d’outils séparés par des virgules ou des espaces, par ex. « Bash Edit ».
    « Bash(git *) » retire tout Bash ; les motifs de commande ne sont pas mis en correspondance.
  --force-mcs      Forcer la projection système en milieu de conversation pour les fournisseurs Anthropic
  --locale <locale>  Langue de l’interface : en-US, zh-CN ou auto
  --mode <mode>    Mode d’autorisation pour les prompts : build, edit, plan ou yolo (par défaut : yolo pour --prompt)
  --resume <sessionId>  Reprendre une session persistée par sessionId (sess_...)
  --target <text>  Exécuter ou définir l’objectif de la session en mode headless
  --target-replace Remplacer tout objectif de session existant défini par --target
  -c, --continue        Reprendre la dernière session du répertoire courant
  --json           Afficher du JSON exploitable par une machine lorsque c’est pris en charge
  --no-browser     Afficher l’URL OAuth sans ouvrir de navigateur
  --no-color       Désactiver les couleurs ANSI
  --verbose        Afficher des détails de diagnostic supplémentaires

Commandes slash :
  /help [command]       Afficher l’aide des commandes slash
  /login                Choisir la connexion navigateur Z.AI ou BigModel
  /logout               Supprimer les identifiants de connexion Z.AI partagés
  /compact [instructions]  Compacter la conversation en cours
  /expert [status|resume|stop|<task>]  Exécuter ou gérer le workflow expert
  /dwf [list|cancel|resume]  Lister, annuler ou reprendre les exécutions de workflows dynamiques
  /fork [latest|checkpointId]  Créer une nouvelle session à partir d’un point de contrôle de l’espace de travail
  /mcp [list|status|connect|disconnect]  Afficher ou gérer les serveurs MCP
  /mode [mode]          Afficher ou changer le mode d’autorisation : build, edit, plan ou yolo
  /model [id]           Afficher ou changer le modèle de la session en cours
  /new                  Démarrer une nouvelle session dans la TUI
  /resume [sessionId]   Reprendre une session par sessionId ; l’omettre pour la dernière du répertoire courant
  /rewind [latest|checkpointId]  Afficher le dernier point de contrôle ou restaurer les fichiers de l’espace de travail
  /skill [name] [task]  Lister les compétences ou forcer le prochain prompt à en charger une
  /goal [action]        Afficher ou définir l’objectif de la session en cours
`,
  },
  tui: {
    copy: {
      copied: "Texte sélectionné copié dans le presse-papiers.",
      failed: "Impossible de copier le texte sélectionné.",
      unavailable: "La copie de texte vers le presse-papiers n’est pas disponible dans ce terminal.",
    },
    effort: {
      disabled: "désactivé",
      enabled: "activé",
    },
    input: {
      activeStatusHint: "esc pour interrompre",
      busyPlaceholder: "Saisissez pour mettre en file d’attente",
      placeholder: "Saisissez un prompt",
      queuedMore: (count) => `+ ${count} de plus en file d’attente`,
      queuedSubmitHint: "Envoyé après le prochain appel d’outil.",
      queuedTitle: (count) => ` File d’attente (${count}) `,
      title: "Saisie",
      noHistorySource: "Aucune source d’historique de saisie n’est configurée.",
      noPreviousInput: "Aucune saisie précédente pour ce projet.",
      restoredPreviousInput: "Saisie précédente restaurée.",
      restoredPreviousInputWithAttachments: (count) =>
        `Saisie précédente restaurée avec ${count} pièce(s) jointe(s).`,
      restorePreviousInputFailed: "Impossible de restaurer la saisie précédente.",
      typePrompt: "Saisissez une question et appuyez sur Entrée.",
    },
    loginRequired: {
      help: "Utilisez /model pour afficher les modèles ou /login pour connecter un compte Coding Plan.",
      message: "Aucun modèle disponible. Configurez un fournisseur ou connectez-vous avec /login.",
      status: "Aucun modèle disponible. Configurez un fournisseur ou connectez-vous avec /login.",
      title: "Configuration du modèle requise",
    },
    loginSetup: {
      emptyMessage: "Aucune option de connexion n’est disponible.",
      help: "Utilisez les flèches haut/bas pour choisir, Entrée pour sélectionner.",
      options: {
        bigmodelApiKey: {
          inputPrimary: "Saisissez la clé API du Coding Plan BigModel",
          inputSecondary: "Collez la clé ici. Elle est masquée pendant la saisie.",
          primary: "Clé API du Coding Plan BigModel",
          secondary: "Collez manuellement une clé API Coding Plan.",
        },
        bigmodelOauth: {
          pendingPrimary: "En attente de l’autorisation BigModel",
          pendingSecondary:
            "Terminez la connexion dans votre navigateur. L’autorisation est détectée automatiquement.",
          primary: "Coding Plan BigModel",
          secondary: "Ouvrez la connexion dans le navigateur ; l’autorisation est détectée automatiquement.",
        },
        zaiApiKey: {
          inputPrimary: "Saisissez la clé API du Coding Plan Z.AI",
          inputSecondary: "Collez la clé ici. Elle est masquée pendant la saisie.",
          primary: "Clé API du Coding Plan Z.AI",
          secondary: "Collez manuellement une clé API Coding Plan.",
        },
        zaiOauth: {
          pendingPrimary: "En attente de l’autorisation Z.AI",
          pendingSecondary:
            "Terminez la connexion dans votre navigateur. Je reprendrai dès que l’autorisation sera terminée.",
          primary: "Coding Plan Z.AI",
          secondary: "Ouvrez la connexion dans le navigateur et créez une clé API Coding Plan.",
        },
      },
      pending: {
        cancelStatus: "Connexion annulée. Choisissez une méthode de configuration.",
        help: "Échap annule et revient aux choix de configuration.",
        status: "En attente de l’autorisation du navigateur…",
      },
      input: {
        cancelStatus: "Saisie de la clé API annulée. Choisissez une méthode de configuration.",
        clearStatus: "Saisie de la clé API effacée.",
        emptyStatus: "La clé API est obligatoire.",
        help: "Entrée enregistre la clé. Échap revient aux choix de configuration.",
        placeholder: "Collez la clé API",
        status: "Saisissez la clé API, puis appuyez sur Entrée.",
        submitStatus: "Enregistrement de la clé API…",
      },
      prompt: "Choisissez une méthode de connexion ou de configuration par clé API.",
      response: "Choisissez comment configurer un fournisseur Coding Plan.",
      title: "Configurer le Coding Plan",
    },
    model: {
      requestFailed: (message) => `Échec de la requête au modèle : ${message}`,
      responseReceived: "Réponse du modèle reçue.",
      responseReceivedWithTokens: (tokens) => `Réponse du modèle reçue. ${tokens} jetons.`,
      retryScheduled: ({ attempt, delay, maxAttempts, reason }) =>
        `Nouvelle tentative de requête au modèle ${attempt}/${Math.max(1, maxAttempts - 1)} dans ${delay} : ${reason}`,
      streamStalled: "Flux du modèle bloqué.",
    },
    sidebar: {
      subagents: {
        title: "Sous-agents",
        empty: "Aucun sous-agent pour l’instant.",
        emptyOutput: "Aucune sortie pour l’instant.",
        back: "← Conversation principale",
        readonly: "Lecture seule · Échap pour revenir",
        loading: "Chargement de la sortie du sous-agent…",
        unavailable: "Sortie du sous-agent indisponible.",
        retry: "Réessayer",
        more: "Charger plus",
        pendingMain: "La conversation principale attend votre saisie — revenez pour répondre",
        ended: (count) => `Terminés (${count})`,
        status: {
          running: "en cours",
          waiting: "en attente",
          blocked: "bloqué",
          success: "terminé",
          failed: "échec",
          cancelled: "annulé",
          lost: "perdu",
        },
      },
      api: {
        empty: "Aucun appel API pour l’instant.",
        model: "Modèle",
        more: (count) => `+${count} de plus`,
        requests: "Requêtes",
        server: "Serveur",
      },
      cache: {
        hit: "succès",
        lastHit: "dernier succès",
        lastMiss: "dernier échec",
        readWrite: ({ read, write }) => `${read} lecture / ${write} écriture`,
        total: "Total",
      },
      context: {
        cache: "Cache",
        cacheReadWrite: "Cache L/E",
        inputOutput: "E/S",
        reason: "Raison",
        tokens: "Jetons",
        used: "Utilisé",
        window: "Fenêtre",
      },
      modifiedFiles: {
        empty: "Aucune modification de fichier pour l’instant.",
        more: (count) => `+${count} de plus`,
      },
      mcp: {
        empty: "Aucun serveur MCP configuré.",
        loadFailed: "État MCP indisponible.",
        loading: "Chargement de l’état MCP…",
        more: (count) => `+${count} de plus`,
        servers: "Serveurs",
        status: {
          connected: "connecté",
          connecting: "connexion en cours",
          disabled: "désactivé",
          disconnected: "déconnecté",
          failed: "échec",
          untrusted: "non approuvé",
        },
        summary: ({ connected, total }) => `${connected}/${total} connectés`,
        tools: (count) => `${count} ${count === 1 ? "outil" : "outils"}`,
      },
      request: {
        complete: "terminé",
        error: "erreur",
        errorWithStatus: (statusCode) => `erreur ${statusCode}`,
        pending: "en attente",
      },
      status: {
        last: "Dernier",
      },
      run: {
        draft: "Brouillon",
        draftChars: (count) => `${count} caractères`,
        draftEmpty: "vide",
        messages: "Messages",
        mode: "Mode",
        model: "Modèle",
        provider: "Fournisseur",
        thought: "Réflexion",
        trace: "Trace",
        turn: "Tour",
        workspace: "Espace de travail",
      },
      sections: {
        apis: "API",
        context: "Contexte",
        mcp: "MCP",
        modifiedFiles: "Fichiers modifiés",
        run: "Exécution",
        status: "Statut",
        todos: "Tâches",
      },
      shellSubtitle: "Shell OpenTUI",
      title: "Barre latérale",
      todos: {
        empty: "Aucune tâche pour l’instant.",
        more: (count) => `+${count} de plus`,
        progress: "Progression",
      },
    },
    status: {
      compactFailed: "Échec de la compression du contexte.",
      compacted: "Conversation compactée.",
      compacting: "Compression du contexte…",
      interruptedStreamDiscarded: "Flux du modèle interrompu ignoré.",
      modelCalling: "Appel du modèle…",
      permissionRequested: (toolName) => `Autorisation demandée pour ${toolName}.`,
      permissionResolved: (toolName) => `Autorisation traitée pour ${toolName}.`,
      ready: "Prêt.",
      recoveringStream: "Récupération du flux du modèle interrompu…",
      retryingStream: "Nouvelle tentative pour le flux du modèle…",
      sessionResumed: "Session reprise.",
      targetChanged: (action) => `Objectif ${action}.`,
      thinking: "Réflexion…",
      toolCompleted: (toolName) => `Outil ${toolName} terminé.`,
      toolFailed: (toolName) => `Échec de l’outil ${toolName}.`,
      toolPending: (toolName) => `Outil ${toolName} en attente.`,
      toolRunning: (toolName) => `Outil ${toolName} en cours.`,
      turnFailed: "Échec du tour.",
    },
    terminal: {
      requiresInteractive: "La TUI nécessite un terminal interactif.",
      starting: "Démarrage de DeepVibe… Ctrl+C pour quitter",
    },
    transcript: {
      compact: {
        completed: "Contexte compressé",
        failed: "Échec de la compression du contexte",
        interrupted: "Compression du contexte interrompue",
        retry: (command) => `Ctrl-R pour réessayer ${command}`,
        retrying: ({ attempt, maxAttempts }) =>
          maxAttempts > 0
            ? `Nouvelle tentative de compression du contexte (${attempt}/${maxAttempts})`
            : "Nouvelle tentative de compression du contexte",
        skipped: "Le contexte est à jour ; aucune compression nécessaire",
        started: "Compression du contexte",
      },
      roles: {
        agent: "Agent",
        system: "Système",
        user: "Utilisateur",
      },
      thought: {
        complete: "Réflexion",
        thinking: "Réflexion…",
      },
      title: "Transcription",
      workflow: {
        actors: "acteurs :",
        actorRow: ({ name, status }) => `${name} - ${status}`,
        usage: ({ spentTokens }) => `utilisation : ${spentTokens} jetons`,
        collapsed: ({ label, status, nodesSettled, nodesTotal }) =>
          `Workflow ${label} - ${status} (${nodesSettled}/${nodesTotal} étapes)`,
        error: (message) => `erreur : ${message}`,
        expandHint: "+ pour développer",
        collapseHint: "- pour réduire",
        log: "journal :",
        nodes: ({ nodesSettled, nodesTotal }) => `${nodesSettled}/${nodesTotal} étapes terminées`,
        result: (preview) => `résultat : ${preview}`,
        status: {
          completed: "terminé",
          errored: "en erreur",
          pending: "en attente",
          running: "en cours",
          stopped: "arrêté",
        },
        stopReason: {
          user: "par vous",
          model: "par l’agent",
          provider: "erreur du modèle",
          interrupted: "processus terminé",
          superseded: "remplacé par une exécution modifiée",
        },
        truncated: "(tronqué - historique complet dans le journal d’exécution)",
        interruptedNotice: ({ label, runId }) =>
          `Le workflow ${label} a été interrompu et peut être repris : /dwf resume ${runId}`,
      },
    },
    selection: {
      defaultHelp: "Entrée sélectionne, Échap annule",
      disabled: (reason) => ` [désactivé : ${reason}]`,
      filterLine: ({ filter, help }) =>
        `filtre : ${filter || "-"} | ${help ?? "Entrée sélectionne, Échap annule"}`,
      noFilter: "-",
    },
    fileMention: {
      empty: "Aucun chemin de l’espace de travail correspondant.",
      loading: "Chargement des chemins de l’espace de travail…",
      row: ({ path, selected }) => `${selected ? ">" : " "} ${path}`,
      title: "Fichiers",
    },
    slash: {
      title: "Commandes",
      row: ({ name, selected, summary }) => `${selected ? ">" : " "} /${name}  ${summary}`,
    },
  },
};
