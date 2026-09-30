import type { ZCodeCopy } from "../types.js";

export const esES: ZCodeCopy = {
  locale: "es-ES",
  cli: {
    errors: {
      localeUnsupported: (value) =>
        `Valor no compatible para --locale: ${value}. Idiomas compatibles: en-US, zh-CN, auto.`,
    },
    help: (version) => `zcode ${version}

Uso:
  zcode [command] [options]

Sin ningún comando, zcode abre la TUI a pantalla completa.

Comandos:
  app-server Ejecuta el servidor de aplicaciones stdio del protocolo de DeepVibe
  commands   Lista los comandos de barra personalizados (\`commands list\`)
  doctor     Inspecciona las suposiciones del entorno de ejecución y del empaquetado
  login [zai|bigmodel]  Inicia sesión mediante autorización en el navegador
  logout     Elimina las credenciales compartidas de inicio de sesión de Z.AI
  plugins    Gestiona plugins y mercados (\`plugins list|install|uninstall|enable|disable|update|validate|marketplace ...\`; alias: plugin)
  skills     Lista las habilidades locales (\`skills list\`)
  tui        Abre la interfaz de terminal
  version    Muestra la versión del CLI

Opciones:
  -h, --help       Muestra la ayuda
  -v, --version    Muestra la versión
  -p, --prompt <text>  Ejecuta un único prompt sin abrir la TUI
  --enable-workflow  Activa los flujos de trabajo dinámicos para --prompt o --target (predeterminado: desactivado)
  --memory-bench   Con --prompt, activa la extracción automática de Memory y espera antes de salir (requiere Memory activado)
  --browser-use <mode> Activa el backend de Browser Use (compatible: headless)
  --surface <surface>  Superficie de presentación para prompts/app-server en modo sin interfaz: terminal o escritorio
  --browser-executable <path> Ejecutable de Chrome/Chromium para Browser Use sin interfaz
  --attach <path>  Adjunta un archivo local a --prompt; repite la opción para varios archivos
  --cwd <path>     Ejecuta este comando desde el directorio indicado
  --disallowed-tools, --disallowedTools <tools...>
    Elimina herramientas completas solo para esta ejecución de prompt/TUI; la configuración guardada no cambia.
    Nombres de herramientas separados por comas o espacios; p. ej., "Bash Edit".
    "Bash(git *)" elimina todo Bash; los patrones de comando no se comparan.
  --force-mcs      Fuerza la proyección del sistema a mitad de conversación para proveedores de Anthropic
  --locale <locale>  Idioma de la interfaz: en-US, zh-CN o auto
  --mode <mode>    Modo de permisos para los prompts: build, edit, plan o yolo (predeterminado: yolo para --prompt)
  --resume <sessionId>  Reanuda una sesión persistida por sessionId (sess_...)
  --target <text>  Ejecuta o establece el objetivo de la sesión en modo sin interfaz
  --target-replace Reemplaza cualquier objetivo de sesión existente establecido por --target
  -c, --continue        Reanuda la última sesión del directorio actual
  --json           Muestra JSON legible por máquina cuando sea compatible
  --no-browser     Muestra la URL de OAuth sin abrir el navegador
  --no-color       Desactiva los colores ANSI
  --verbose        Muestra detalles de diagnóstico adicionales

Comandos de barra:
  /help [command]       Muestra la ayuda de los comandos de barra
  /login                Elige el inicio de sesión en el navegador con Z.AI o BigModel
  /logout               Elimina las credenciales compartidas de inicio de sesión de Z.AI
  /compact [instructions]  Compacta la conversación actual
  /expert [status|resume|stop|<task>]  Ejecuta o gestiona el flujo de trabajo de experto
  /dwf [list|cancel|resume]  Lista, cancela o reanuda ejecuciones de flujos de trabajo dinámicos
  /fork [latest|checkpointId]  Bifurca una nueva sesión desde un punto de control del espacio de trabajo
  /mcp [list|status|connect|disconnect]  Muestra o gestiona los servidores MCP
  /mode [mode]          Muestra o cambia el modo de permisos: build, edit, plan o yolo
  /model [id]           Muestra o cambia el modelo de la sesión actual
  /new                  Inicia una sesión nueva en la TUI
  /resume [sessionId]   Reanuda una sesión por sessionId; omítelo para usar la última del directorio actual
  /rewind [latest|checkpointId]  Muestra el último punto de control o restaura los archivos del espacio de trabajo
  /skill [name] [task]  Lista las habilidades o fuerza que el próximo prompt cargue una
  /goal [action]        Muestra o establece el objetivo de la sesión actual
`,
  },
  tui: {
    copy: {
      copied: "Texto seleccionado copiado al portapapeles.",
      failed: "No se pudo copiar el texto seleccionado.",
      unavailable: "Copiar texto al portapapeles no está disponible en este terminal.",
    },
    effort: {
      disabled: "desactivado",
      enabled: "activado",
    },
    input: {
      activeStatusHint: "esc para interrumpir",
      busyPlaceholder: "Escribe para poner en cola",
      placeholder: "Escribe un prompt",
      queuedMore: (count) => `+ ${count} más en cola`,
      queuedSubmitHint: "Se enviará después de la siguiente llamada a herramienta.",
      queuedTitle: (count) => ` Cola (${count}) `,
      title: "Entrada",
      noHistorySource: "No hay ninguna fuente de historial de entrada configurada.",
      noPreviousInput: "No hay entradas anteriores en este proyecto.",
      restoredPreviousInput: "Entrada anterior restaurada.",
      restoredPreviousInputWithAttachments: (count) =>
        `Entrada anterior restaurada con ${count} archivos adjuntos.`,
      restorePreviousInputFailed: "No se pudo restaurar la entrada anterior.",
      typePrompt: "Escribe una pregunta y pulsa Intro.",
    },
    loginRequired: {
      help: "Usa /model para ver los modelos o /login para conectar una cuenta de Coding Plan.",
      message: "No hay modelos disponibles. Configura un proveedor o inicia sesión con /login.",
      status: "No hay modelos disponibles. Configura un proveedor o inicia sesión con /login.",
      title: "configuración del modelo necesaria",
    },
    loginSetup: {
      emptyMessage: "No hay opciones de inicio de sesión disponibles.",
      help: "Usa Arriba/Abajo para elegir e Intro para seleccionar.",
      options: {
        bigmodelApiKey: {
          inputPrimary: "Introduce la clave de API de BigModel Coding Plan",
          inputSecondary: "Pega la clave aquí. Permanecerá oculta mientras escribes.",
          primary: "Clave de API de BigModel Coding Plan",
          secondary: "Pega manualmente una clave de API de Coding Plan.",
        },
        bigmodelOauth: {
          pendingPrimary: "Esperando la autorización de BigModel",
          pendingSecondary:
            "Completa el inicio de sesión en el navegador. La autorización se detecta automáticamente.",
          primary: "BigModel Coding Plan",
          secondary: "Abre el inicio de sesión en el navegador; la autorización se detecta automáticamente.",
        },
        zaiApiKey: {
          inputPrimary: "Introduce la clave de API de Z.AI Coding Plan",
          inputSecondary: "Pega la clave aquí. Permanecerá oculta mientras escribes.",
          primary: "Clave de API de Z.AI Coding Plan",
          secondary: "Pega manualmente una clave de API de Coding Plan.",
        },
        zaiOauth: {
          pendingPrimary: "Esperando la autorización de Z.AI",
          pendingSecondary:
            "Completa el inicio de sesión en el navegador. Continuaré cuando termine la autorización.",
          primary: "Z.AI Coding Plan",
          secondary: "Abre el inicio de sesión en el navegador y crea una clave de API de Coding Plan.",
        },
      },
      pending: {
        cancelStatus: "Inicio de sesión cancelado. Elige un método de configuración.",
        help: "Esc cancela y vuelve a las opciones de configuración.",
        status: "Esperando la autorización del navegador...",
      },
      input: {
        cancelStatus: "Entrada de la clave de API cancelada. Elige un método de configuración.",
        clearStatus: "Entrada de la clave de API borrada.",
        emptyStatus: "La clave de API es obligatoria.",
        help: "Intro guarda la clave. Esc vuelve a las opciones de configuración.",
        placeholder: "Pega la clave de API",
        status: "Introduce la clave de API y pulsa Intro.",
        submitStatus: "Guardando la clave de API...",
      },
      prompt: "Elige un método de inicio de sesión o de clave de API.",
      response: "Elige cómo configurar un proveedor de Coding Plan.",
      title: "Configurar Coding Plan",
    },
    model: {
      requestFailed: (message) => `Error en la solicitud al modelo: ${message}`,
      responseReceived: "Respuesta del modelo recibida.",
      responseReceivedWithTokens: (tokens) => `Respuesta del modelo recibida. ${tokens} tokens.`,
      retryScheduled: ({ attempt, delay, maxAttempts, reason }) =>
        `Reintentando la solicitud al modelo ${attempt}/${Math.max(1, maxAttempts - 1)} en ${delay}: ${reason}`,
      streamStalled: "La transmisión del modelo se ha detenido.",
    },
    sidebar: {
      subagents: {
        title: "Subagentes",
        empty: "Aún no hay subagentes.",
        emptyOutput: "Aún no hay salida.",
        back: "← Conversación principal",
        readonly: "Solo lectura · Esc para volver",
        loading: "Cargando la salida del subagente...",
        unavailable: "La salida del subagente no está disponible.",
        retry: "Reintentar",
        more: "Cargar más",
        pendingMain: "La conversación principal necesita tu respuesta: vuelve para responder",
        ended: (count) => `Finalizados (${count})`,
        status: {
          running: "en ejecución",
          waiting: "en espera",
          blocked: "bloqueado",
          success: "completado",
          failed: "fallido",
          cancelled: "cancelado",
          lost: "perdido",
        },
      },
      api: {
        empty: "Aún no hay llamadas a la API.",
        model: "Modelo",
        more: (count) => `+${count} más`,
        requests: "Solicitudes",
        server: "Servidor",
      },
      cache: {
        hit: "acierto",
        lastHit: "último acierto",
        lastMiss: "último fallo",
        readWrite: ({ read, write }) => `${read} leídos / ${write} escritos`,
        total: "Total",
      },
      context: {
        cache: "Caché",
        cacheReadWrite: "Caché L/E",
        inputOutput: "E/S",
        reason: "Motivo",
        tokens: "Tokens",
        used: "Usado",
        window: "Ventana",
      },
      modifiedFiles: {
        empty: "Aún no hay cambios en los archivos.",
        more: (count) => `+${count} más`,
      },
      mcp: {
        empty: "No hay servidores MCP configurados.",
        loadFailed: "El estado de MCP no está disponible.",
        loading: "Cargando el estado de MCP...",
        more: (count) => `+${count} más`,
        servers: "Servidores",
        status: {
          connected: "conectado",
          connecting: "conectando",
          disabled: "desactivado",
          disconnected: "desconectado",
          failed: "fallido",
          untrusted: "no confiable",
        },
        summary: ({ connected, total }) => `${connected}/${total} conectados`,
        tools: (count) => `${count} ${count === 1 ? "herramienta" : "herramientas"}`,
      },
      request: {
        complete: "completa",
        error: "error",
        errorWithStatus: (statusCode) => `error ${statusCode}`,
        pending: "pendiente",
      },
      status: {
        last: "Última",
      },
      run: {
        draft: "Borrador",
        draftChars: (count) => `${count} car.`,
        draftEmpty: "vacío",
        messages: "Mensajes",
        mode: "Modo",
        model: "Modelo",
        provider: "Proveedor",
        thought: "Pensamiento",
        trace: "Traza",
        turn: "Turno",
        workspace: "Espacio de trabajo",
      },
      sections: {
        apis: "APIs",
        context: "Contexto",
        mcp: "MCP",
        modifiedFiles: "Archivos modificados",
        run: "Ejecución",
        status: "Estado",
        todos: "Tareas",
      },
      shellSubtitle: "Shell de OpenTUI",
      title: "Barra lateral",
      todos: {
        empty: "Aún no hay tareas.",
        more: (count) => `+${count} más`,
        progress: "Progreso",
      },
    },
    status: {
      compactFailed: "Error al comprimir el contexto.",
      compacted: "Conversación compactada.",
      compacting: "Comprimiendo el contexto...",
      interruptedStreamDiscarded: "Se ha descartado la transmisión del modelo interrumpida.",
      modelCalling: "Llamando al modelo...",
      permissionRequested: (toolName) => `Permiso solicitado para ${toolName}.`,
      permissionResolved: (toolName) => `Permiso resuelto para ${toolName}.`,
      ready: "Listo.",
      recoveringStream: "Recuperando la transmisión del modelo interrumpida...",
      retryingStream: "Reintentando la transmisión del modelo...",
      sessionResumed: "Sesión reanudada.",
      targetChanged: (action) => `Objetivo ${action}.`,
      thinking: "Pensando...",
      toolCompleted: (toolName) => `Herramienta ${toolName} completada.`,
      toolFailed: (toolName) => `Herramienta ${toolName} fallida.`,
      toolPending: (toolName) => `Herramienta ${toolName} pendiente.`,
      toolRunning: (toolName) => `Herramienta ${toolName} en ejecución.`,
      turnFailed: "El turno ha fallado.",
    },
    terminal: {
      requiresInteractive: "La TUI requiere un terminal interactivo.",
      starting: "Iniciando DeepVibe... Ctrl+C para salir",
    },
    transcript: {
      compact: {
        completed: "Contexto comprimido",
        failed: "Error al comprimir el contexto",
        interrupted: "Compresión del contexto interrumpida",
        retry: (command) => `Ctrl-R para reintentar ${command}`,
        retrying: ({ attempt, maxAttempts }) =>
          maxAttempts > 0
            ? `Reintentando la compresión del contexto (${attempt}/${maxAttempts})`
            : "Reintentando la compresión del contexto",
        skipped: "El contexto está actualizado; no hace falta comprimirlo",
        started: "Comprimiendo el contexto",
      },
      roles: {
        agent: "Agente",
        system: "Sistema",
        user: "Usuario",
      },
      thought: {
        complete: "Pensamiento",
        thinking: "Pensando...",
      },
      title: "Transcripción",
      workflow: {
        actors: "actores:",
        actorRow: ({ name, status }) => `${name} - ${status}`,
        usage: ({ spentTokens }) => `uso: ${spentTokens} tokens`,
        collapsed: ({ label, status, nodesSettled, nodesTotal }) =>
          `Flujo de trabajo ${label} - ${status} (${nodesSettled}/${nodesTotal} pasos)`,
        error: (message) => `error: ${message}`,
        expandHint: "+ para expandir",
        collapseHint: "- para contraer",
        log: "registro:",
        nodes: ({ nodesSettled, nodesTotal }) => `${nodesSettled}/${nodesTotal} pasos completados`,
        result: (preview) => `resultado: ${preview}`,
        status: {
          completed: "completado",
          errored: "con error",
          pending: "pendiente",
          running: "en ejecución",
          stopped: "detenido",
        },
        stopReason: {
          user: "por ti",
          model: "por el agente",
          provider: "error del modelo",
          interrupted: "el proceso finalizó",
          superseded: "reemplazado por una ejecución modificada",
        },
        truncated: "(truncado - el historial completo está en el registro de la ejecución)",
        interruptedNotice: ({ label, runId }) =>
          `El flujo de trabajo ${label} se interrumpió y se puede reanudar: /dwf resume ${runId}`,
      },
    },
    selection: {
      defaultHelp: "Intro selecciona, Esc cancela",
      disabled: (reason) => ` [desactivado: ${reason}]`,
      filterLine: ({ filter, help }) =>
        `filtro: ${filter || "-"} | ${help ?? "Intro selecciona, Esc cancela"}`,
      noFilter: "-",
    },
    fileMention: {
      empty: "No hay rutas del espacio de trabajo que coincidan.",
      loading: "Cargando las rutas del espacio de trabajo...",
      row: ({ path, selected }) => `${selected ? ">" : " "} ${path}`,
      title: "Archivos",
    },
    slash: {
      title: "Comandos",
      row: ({ name, selected, summary }) => `${selected ? ">" : " "} /${name}  ${summary}`,
    },
  },
};
