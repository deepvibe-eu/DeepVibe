import type { ZCodeCopy } from "../types.js";

export const ruRU: ZCodeCopy = {
  locale: "ru-RU",
  cli: {
    errors: {
      localeUnsupported: (value) =>
        `Неподдерживаемое значение --locale: ${value}. Поддерживаемые локали: en-US, zh-CN, auto.`,
    },
    help: (version) => `zcode ${version}

Использование:
  zcode [command] [options]

Без команды zcode открывает полноэкранный TUI.

Команды:
  app-server Запустить stdio-сервер приложения DeepVibe Protocol
  commands   Показать пользовательские слэш-команды (\`commands list\`)
  doctor     Проверить предположения о среде выполнения и упаковке
  login [zai|bigmodel]  Войти через авторизацию в браузере
  logout     Удалить общие учётные данные входа Z.AI
  plugins    Управлять плагинами и маркетплейсами (\`plugins list|install|uninstall|enable|disable|update|validate|marketplace ...\`; псевдоним: plugin)
  skills     Показать локальные навыки (\`skills list\`)
  tui        Открыть терминальный интерфейс
  version    Показать версию CLI

Параметры:
  -h, --help       Показать справку
  -v, --version    Показать версию
  -p, --prompt <text>  Выполнить один запрос, не открывая TUI
  --enable-workflow  Включить динамические рабочие процессы для --prompt или --target (по умолчанию: выключено)
  --memory-bench   С --prompt включить автоматическое извлечение памяти и дождаться завершения перед выходом (требуется включённая память)
  --browser-use <mode> Включить бэкенд Browser Use (поддерживается: headless)
  --surface <surface>  Поверхность представления для headless-запросов и app-server: terminal или desktop
  --browser-executable <path> Исполняемый файл Chrome/Chromium для headless-режима Browser Use
  --attach <path>  Прикрепить локальный файл к --prompt; повторите для нескольких файлов
  --cwd <path>     Выполнить команду из указанного каталога
  --disallowed-tools, --disallowedTools <tools...>
    Удалить инструменты целиком только для этого запроса/запуска TUI; сохранённые настройки не меняются.
    Имена инструментов через запятую или пробел, например "Bash Edit".
    "Bash(git *)" удаляет весь Bash; шаблоны команд не сопоставляются.
  --force-mcs      Принудительно применять системную проекцию в середине диалога для провайдеров Anthropic
  --locale <locale>  Локаль интерфейса: en-US, zh-CN или auto
  --mode <mode>    Режим разрешений для запросов: build, edit, plan или yolo (по умолчанию: yolo для --prompt)
  --resume <sessionId>  Возобновить сохранённый сеанс по sessionId (sess_...)
  --target <text>  Выполнить или задать цель сеанса в headless-режиме
  --target-replace Заменить существующую цель сеанса, заданную через --target
  -c, --continue        Возобновить последний сеанс для текущего каталога
  --json           Выводить машиночитаемый JSON, где это поддерживается
  --no-browser     Вывести URL OAuth, не открывая браузер
  --no-color       Отключить цвета ANSI
  --verbose        Выводить дополнительные диагностические сведения

Слэш-команды:
  /help [command]       Показать справку по слэш-командам
  /login                Выбрать вход Z.AI или BigModel через браузер
  /logout               Удалить общие учётные данные входа Z.AI
  /compact [instructions]  Сжать текущий диалог
  /expert [status|resume|stop|<task>]  Запустить экспертный рабочий процесс или управлять им
  /dwf [list|cancel|resume]  Показать, отменить или возобновить запуски динамических рабочих процессов
  /fork [latest|checkpointId]  Создать новый сеанс из контрольной точки рабочей области
  /mcp [list|status|connect|disconnect]  Показать серверы MCP или управлять ими
  /mode [mode]          Показать или переключить режим разрешений: build, edit, plan или yolo
  /model [id]           Показать или переключить модель текущего сеанса
  /new                  Начать новый сеанс в TUI
  /resume [sessionId]   Возобновить сеанс по sessionId; без него — последний в текущем каталоге
  /rewind [latest|checkpointId]  Показать последнюю контрольную точку или восстановить файлы рабочей области
  /skill [name] [task]  Показать навыки или принудительно загрузить один из них для следующего запроса
  /goal [action]        Показать или задать цель текущего сеанса
`,
  },
  tui: {
    copy: {
      copied: "Выделенный текст скопирован в буфер обмена.",
      failed: "Не удалось скопировать выделенный текст.",
      unavailable: "Копирование текста в буфер обмена недоступно в этом терминале.",
    },
    effort: {
      disabled: "выключено",
      enabled: "включено",
    },
    input: {
      activeStatusHint: "esc — прервать",
      busyPlaceholder: "Введите текст для очереди",
      placeholder: "Введите запрос",
      queuedMore: (count) => `+ ${count} ещё в очереди`,
      queuedSubmitHint: "Отправится после следующего вызова инструмента.",
      queuedTitle: (count) => ` Очередь (${count}) `,
      title: "Ввод",
      noHistorySource: "Источник истории ввода не настроен.",
      noPreviousInput: "Нет предыдущего ввода для этого проекта.",
      restoredPreviousInput: "Предыдущий ввод восстановлен.",
      restoredPreviousInputWithAttachments: (count) =>
        `Предыдущий ввод восстановлен, вложений: ${count}.`,
      restorePreviousInputFailed: "Не удалось восстановить предыдущий ввод.",
      typePrompt: "Введите вопрос и нажмите Enter.",
    },
    loginRequired: {
      help: "Используйте /model, чтобы посмотреть модели, или /login, чтобы подключить аккаунт Coding Plan.",
      message: "Нет доступных моделей. Настройте провайдера или войдите через /login.",
      status: "Нет доступных моделей. Настройте провайдера или войдите через /login.",
      title: "требуется настройка модели",
    },
    loginSetup: {
      emptyMessage: "Нет доступных вариантов входа.",
      help: "Стрелки вверх/вниз — выбор, Enter — подтвердить.",
      options: {
        bigmodelApiKey: {
          inputPrimary: "Введите API-ключ BigModel Coding Plan",
          inputSecondary: "Вставьте ключ здесь. При вводе он скрыт.",
          primary: "API-ключ BigModel Coding Plan",
          secondary: "Вставьте API-ключ Coding Plan вручную.",
        },
        bigmodelOauth: {
          pendingPrimary: "Ожидание авторизации BigModel",
          pendingSecondary:
            "Завершите вход в браузере. Авторизация определяется автоматически.",
          primary: "BigModel Coding Plan",
          secondary: "Вход через браузер; авторизация определяется автоматически.",
        },
        zaiApiKey: {
          inputPrimary: "Введите API-ключ Z.AI Coding Plan",
          inputSecondary: "Вставьте ключ здесь. При вводе он скрыт.",
          primary: "API-ключ Z.AI Coding Plan",
          secondary: "Вставьте API-ключ Coding Plan вручную.",
        },
        zaiOauth: {
          pendingPrimary: "Ожидание авторизации Z.AI",
          pendingSecondary:
            "Завершите вход в браузере. Я продолжу, когда авторизация завершится.",
          primary: "Z.AI Coding Plan",
          secondary: "Вход через браузер и создание API-ключа Coding Plan.",
        },
      },
      pending: {
        cancelStatus: "Вход отменён. Выберите способ настройки.",
        help: "Esc отменяет и возвращает к вариантам настройки.",
        status: "Ожидание авторизации в браузере...",
      },
      input: {
        cancelStatus: "Ввод API-ключа отменён. Выберите способ настройки.",
        clearStatus: "Ввод API-ключа очищен.",
        emptyStatus: "Требуется API-ключ.",
        help: "Enter сохраняет ключ. Esc возвращает к вариантам настройки.",
        placeholder: "Вставьте API-ключ",
        status: "Введите API-ключ и нажмите Enter.",
        submitStatus: "Сохранение API-ключа...",
      },
      prompt: "Выберите способ входа или настройки API-ключа.",
      response: "Выберите способ настройки провайдера Coding Plan.",
      title: "Настройка Coding Plan",
    },
    model: {
      requestFailed: (message) => `Сбой запроса к модели: ${message}`,
      responseReceived: "Ответ модели получен.",
      responseReceivedWithTokens: (tokens) => `Ответ модели получен. Токенов: ${tokens}.`,
      retryScheduled: ({ attempt, delay, maxAttempts, reason }) =>
        `Повтор запроса к модели ${attempt}/${Math.max(1, maxAttempts - 1)} через ${delay}: ${reason}`,
      streamStalled: "Поток модели остановился.",
    },
    sidebar: {
      subagents: {
        title: "Подагенты",
        empty: "Подагентов пока нет.",
        emptyOutput: "Вывода пока нет.",
        back: "← Основной диалог",
        readonly: "Только чтение · Esc — вернуться",
        loading: "Загрузка вывода подагента...",
        unavailable: "Вывод подагента недоступен.",
        retry: "Повторить",
        more: "Показать ещё",
        pendingMain: "Основной диалог ожидает вашего ввода — вернитесь, чтобы ответить",
        ended: (count) => `Завершено (${count})`,
        status: {
          running: "выполняется",
          waiting: "ожидание",
          blocked: "заблокировано",
          success: "завершено",
          failed: "ошибка",
          cancelled: "отменено",
          lost: "потеряно",
        },
      },
      api: {
        empty: "Вызовов API пока нет.",
        model: "Модель",
        more: (count) => `ещё +${count}`,
        requests: "Запросы",
        server: "Сервер",
      },
      cache: {
        hit: "попадание",
        lastHit: "последнее попадание",
        lastMiss: "последний промах",
        readWrite: ({ read, write }) => `${read} чтение / ${write} запись`,
        total: "всего",
      },
      context: {
        cache: "Кэш",
        cacheReadWrite: "Чтение/запись кэша",
        inputOutput: "Ввод/вывод",
        reason: "Рассуждение",
        tokens: "Токены",
        used: "Использовано",
        window: "Окно",
      },
      modifiedFiles: {
        empty: "Изменений файлов пока нет.",
        more: (count) => `ещё +${count}`,
      },
      mcp: {
        empty: "Серверы MCP не настроены.",
        loadFailed: "Статус MCP недоступен.",
        loading: "Загрузка статуса MCP...",
        more: (count) => `ещё +${count}`,
        servers: "Серверы",
        status: {
          connected: "подключено",
          connecting: "подключение",
          disabled: "отключено",
          disconnected: "не подключено",
          failed: "ошибка",
          untrusted: "недоверенный",
        },
        summary: ({ connected, total }) => `${connected}/${total} подключено`,
        tools: (count) => `${count} ${count === 1 ? "инструмент" : "инструментов"}`,
      },
      request: {
        complete: "завершено",
        error: "ошибка",
        errorWithStatus: (statusCode) => `ошибка ${statusCode}`,
        pending: "ожидание",
      },
      status: {
        last: "Последний",
      },
      run: {
        draft: "Черновик",
        draftChars: (count) => `${count} симв.`,
        draftEmpty: "пусто",
        messages: "Сообщения",
        mode: "Режим",
        model: "Модель",
        provider: "Провайдер",
        thought: "Рассуждение",
        trace: "Трассировка",
        turn: "Ход",
        workspace: "Рабочая область",
      },
      sections: {
        apis: "API",
        context: "Контекст",
        mcp: "MCP",
        modifiedFiles: "Изменённые файлы",
        run: "Запуск",
        status: "Статус",
        todos: "Задачи",
      },
      shellSubtitle: "Оболочка OpenTUI",
      title: "Боковая панель",
      todos: {
        empty: "Задач пока нет.",
        more: (count) => `ещё +${count}`,
        progress: "Прогресс",
      },
    },
    status: {
      compactFailed: "Не удалось сжать контекст.",
      compacted: "Диалог сжат.",
      compacting: "Сжатие контекста...",
      interruptedStreamDiscarded: "Прерванный поток модели отброшен.",
      modelCalling: "Вызов модели...",
      permissionRequested: (toolName) => `Запрошено разрешение для ${toolName}.`,
      permissionResolved: (toolName) => `Разрешение для ${toolName} получено.`,
      ready: "Готово.",
      recoveringStream: "Восстановление прерванного потока модели...",
      retryingStream: "Повтор потока модели...",
      sessionResumed: "Сеанс возобновлён.",
      targetChanged: (action) => `Цель ${action}.`,
      thinking: "Размышление...",
      toolCompleted: (toolName) => `Инструмент ${toolName} завершён.`,
      toolFailed: (toolName) => `Инструмент ${toolName} завершился с ошибкой.`,
      toolPending: (toolName) => `Инструмент ${toolName} в ожидании.`,
      toolRunning: (toolName) => `Инструмент ${toolName} выполняется.`,
      turnFailed: "Ход завершился с ошибкой.",
    },
    terminal: {
      requiresInteractive: "TUI требует интерактивного терминала.",
      starting: "Запуск DeepVibe... Ctrl+C для выхода",
    },
    transcript: {
      compact: {
        completed: "Контекст сжат",
        failed: "Не удалось сжать контекст",
        interrupted: "Сжатие контекста прервано",
        retry: (command) => `Ctrl-R — повторить ${command}`,
        retrying: ({ attempt, maxAttempts }) =>
          maxAttempts > 0
            ? `Повтор сжатия контекста (${attempt}/${maxAttempts})`
            : "Повтор сжатия контекста",
        skipped: "Контекст актуален; сжатие не требуется",
        started: "Сжатие контекста",
      },
      roles: {
        agent: "Агент",
        system: "Система",
        user: "Пользователь",
      },
      thought: {
        complete: "Рассуждение",
        thinking: "Размышление...",
      },
      title: "Стенограмма",
      workflow: {
        actors: "участники:",
        actorRow: ({ name, status }) => `${name} - ${status}`,
        usage: ({ spentTokens }) => `использовано: ${spentTokens} токенов`,
        collapsed: ({ label, status, nodesSettled, nodesTotal }) =>
          `Рабочий процесс ${label} - ${status} (${nodesSettled}/${nodesTotal} шагов)`,
        error: (message) => `ошибка: ${message}`,
        expandHint: "+ — развернуть",
        collapseHint: "- — свернуть",
        log: "журнал:",
        nodes: ({ nodesSettled, nodesTotal }) => `${nodesSettled}/${nodesTotal} шагов завершено`,
        result: (preview) => `результат: ${preview}`,
        status: {
          completed: "завершено",
          errored: "сбой",
          pending: "ожидание",
          running: "выполняется",
          stopped: "остановлено",
        },
        stopReason: {
          user: "вами",
          model: "агентом",
          provider: "ошибка модели",
          interrupted: "процесс завершён",
          superseded: "заменено изменённым запуском",
        },
        truncated: "(сокращено — полная история в журнале запуска)",
        interruptedNotice: ({ label, runId }) =>
          `Рабочий процесс ${label} был прерван, его можно возобновить: /dwf resume ${runId}`,
      },
    },
    selection: {
      defaultHelp: "Enter — выбрать, Esc — отмена",
      disabled: (reason) => ` [недоступно: ${reason}]`,
      filterLine: ({ filter, help }) =>
        `фильтр: ${filter || "-"} | ${help ?? "Enter — выбрать, Esc — отмена"}`,
      noFilter: "-",
    },
    fileMention: {
      empty: "Нет подходящих путей в рабочей области.",
      loading: "Загрузка путей рабочей области...",
      row: ({ path, selected }) => `${selected ? ">" : " "} ${path}`,
      title: "Файлы",
    },
    slash: {
      title: "Команды",
      row: ({ name, selected, summary }) => `${selected ? ">" : " "} /${name}  ${summary}`,
    },
  },
};
