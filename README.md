# SoundboardHotkeys

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![Vencord](https://img.shields.io/badge/Vencord-userplugin-ed4245.svg)](https://vencord.dev)
[![venpm](https://img.shields.io/badge/venpm-installable-5865f2.svg)](https://venpm.dev)

Плагин для [Vencord](https://vencord.dev), который назначает **глобальные хоткеи** на
звуки нативной звуковой панели Discord.

Нажали `Alt+Num1`, не выходя из полноэкранной игры — звук ушёл в голосовой канал, и
**его слышат все**.

![Окно настроек](docs/img/settings.png)

> 🇬🇧 **English** — see the collapsible *English version* section at the bottom of this
> page. No need to navigate away.

---

## Зачем

Звуковая панель Discord запускается только кликом по кнопке в интерфейсе. В главном
сценарии — вы в игре, Discord свёрнут — это бесполезно: нужно альт-табнуться. Плагин
закрывает именно этот разрыв.

## Возможности

- **По-настоящему глобальные хоткеи.** Регистрируются в main-процессе Electron через
  `globalShortcut`, поэтому срабатывают при свёрнутом Discord и в полноэкранной игре.
- **Нативная звуковая панель.** Звук идёт через саму soundboard Discord — его слышат все
  в голосовом канале, а не только вы.
- **Два способа привязки.** Правый клик по звуку → *Назначить хоткей*, либо выбор из
  списка с поиском прямо в настройках плагина.
- **Запись нажатием.** Нажали на кнопку с клавишей, нажали комбинацию. Esc — отмена.
- **Читаемые клавиши.** Показываются как `Alt + Num1`, а не `Alt+num1`.
- **Русский и английский.** Язык берётся из настроек Discord автоматически.
- **Честные ошибки.** Не в голосовом канале, микрофон выключен, кулдаун, комбинация
  занята другим приложением — о каждом случае плагин сообщает, а не молчит.

## Требования

| | |
|---|---|
| Discord | **Десктопное приложение.** В браузере глобальных хоткеев не существует |
| [Node.js](https://nodejs.org) | 18 или новее |
| [pnpm](https://pnpm.io) | `npm i -g pnpm` |
| [Git](https://git-scm.com) | любая свежая версия |

## Установка

Три способа, от простого к сложному.

> **Почему нельзя «просто закинуть один файл»?**
> Плагины Vencord компилируются вместе с самим клиентом — готового «файла-установщика»
> в Vencord не существует в принципе. Плюс глобальные хоткеи требуют `globalShortcut`
> из Electron, а он доступен только через файл `native.ts`, который попадает в сборку
> лишь когда **Vencord собран из исходников**. Это цена данной функции.
>
> *(Формат `apk` — это Android-приложения, к Discord отношения не имеет. Один файл
> `.plugin.js` — это BetterDiscord, другой клиент-мод.)*

### Способ 1 — venpm (самый простой)

[venpm](https://venpm.dev) — пакетный менеджер плагинов Vencord. Две команды:

```bash
npm install -g @kamaras/venpm

venpm repo add https://github.com/GriffTanen/vc-soundboard-hotkeys/releases/latest/download/plugins.json --name soundboard-hotkeys
venpm install soundboardHotkeys
venpm rebuild
```

Дальше — перезапустить Discord и включить плагин (шаги 6–7 ниже).

### Способ 2 — архив из Releases (без git)

Скачайте `soundboardHotkeys.zip` со страницы
[Releases](https://github.com/GriffTanen/vc-soundboard-hotkeys/releases/latest),
распакуйте папку `soundboardHotkeys` в `<Vencord>/src/userplugins/`, затем выполните
`pnpm build` и перезапустите Discord.

### Способ 3 — вручную, по шагам

> **Почему нельзя просто «закинуть файл»?**
> Глобальные хоткеи требуют `globalShortcut` из Electron, а он существует только в
> main-процессе. Vencord добирается до него через файл `native.ts`, и этот файл
> **попадает в сборку только если Vencord собран из исходников**. Готовая установка
> Vencord такого не умеет. Это цена данной функции.

### Шаг 1 — Проверьте инструменты

```bash
node --version   # v18.0.0 или выше
pnpm --version   # любая версия
git --version    # любая версия
```

Если команда «не найдена» — установите её по ссылке из таблицы выше и заново откройте
терминал.

### Шаг 2 — Скачайте исходники Vencord

Выберите папку, которую не будете удалять: она понадобится при каждом обновлении.

```bash
git clone https://github.com/Vendicated/Vencord
cd Vencord
pnpm install --frozen-lockfile
```

Последняя команда скачивает зависимости, это занимает пару минут.

### Шаг 3 — Добавьте плагин

Находясь внутри папки `Vencord`:

```bash
mkdir -p src/userplugins
git clone https://github.com/GriffTanen/vc-soundboard-hotkeys src/userplugins/_shk
mv src/userplugins/_shk/src/soundboardHotkeys src/userplugins/soundboardHotkeys
rm -rf src/userplugins/_shk
```

Проверьте — в папке должно быть ровно пять файлов:

```bash
ls src/userplugins/soundboardHotkeys
# HotkeyRecorder.tsx  i18n.ts  index.tsx  native.ts  types.ts
```

> Никогда не оставляйте **пустую** папку внутри `src/userplugins` — сборка Vencord
> сломается.

### Шаг 4 — Соберите

```bash
pnpm build
```

В конце выводится список собранных файлов. Ошибка на этом шаге означает, что шаг 3
выполнен неверно.

### Шаг 5 — Установите в Discord

```bash
pnpm inject
```

Выберите вашу установку Discord, когда спросят.

### Шаг 6 — Полностью перезапустите Discord

Закрыть окно **недостаточно** — Discord продолжает работать в трее.
Правый клик по значку в трее → *Выйти из Discord*, затем запустите заново.

### Шаг 7 — Включите плагин

**Настройки пользователя → Vencord → Plugins → SoundboardHotkeys** → включите.

Если плагина нет в списке — шаг 4 или 5 не завершился, повторите их.

## Использование

### Назначить хоткей

Двумя способами, как удобнее:

- **Из окна настроек** — откройте шестерёнку плагина, выберите звук в поле
  *Выберите звук…* и нажмите нужную комбинацию.
- **Из звуковой панели** — правый клик по любому звуку → **Назначить хоткей**, затем
  нажмите комбинацию.

![Назначить хоткей через контекстное меню звука](docs/img/context-menu.png)

### Проиграть

Зайдите в голосовой канал и нажмите клавишу. Работает при свёрнутом Discord и в
полноэкранной игре — ради этого всё и делалось.

### Как выбирать комбинации

Пока Discord запущен, зарегистрированная комбинация **перехватывается на уровне
системы** — другие приложения её не получат. Берите редкие сочетания вроде `Alt+Num1` и
избегайте того, что уже занято игрой или системой.

По умолчанию не назначено ничего — намеренно.

## Обновление

Из папки `Vencord`:

```bash
cd src/userplugins/soundboardHotkeys
git pull            # только если оставляли папку как git-клон
cd ../../..
pnpm build
```

После этого перезапустите Discord.

## Удаление

```bash
rm -rf src/userplugins/soundboardHotkeys
pnpm build
```

Чтобы убрать Vencord целиком — `pnpm uninject`.

## Что делать, если не работает

| Симптом | Причина |
|---|---|
| Плагина нет в списке | Сборка или inject не завершились — повторите шаги 4–6 |
| Хоткей не срабатывает | Комбинация занята другим приложением; плагин сообщает об этом уведомлением. Возьмите другую |
| Уведомление «Зайдите в голосовой канал» | Звуковая панель работает только внутри голосового канала |
| Ничего не происходит при выключенном микрофоне | Discord блокирует soundboard при mute и deaf |
| Работает в окне, но не в свёрнутом виде | Vencord собран не из исходников — см. врезку перед шагом 1 |

## Ограничения

Правила Discord, а не плагина:

- Нужно находиться в голосовом канале и не быть в mute/deaf/suppress.
- Требуются права `SPEAK` + `USE_SOUNDBOARD` (и `USE_EXTERNAL_SOUNDS` для звуков с
  другого сервера).
- Кулдаун между звуками — примерно 5 секунд.

Особенности самого плагина:

- Нажатия опрашиваются каждые 100 мс, потому что Vencord не даёт плагинам получать
  push-события IPC. Задержка — до ~100 мс.
- Только десктоп.

## Как это устроено

Два процесса Electron, потому что ни одна половина не может выполнить задачу целиком:

- **[`native.ts`](src/soundboardHotkeys/native.ts)** (main-процесс) — единственное место,
  где существует `globalShortcut`. Регистрирует комбинации и копит нажатия в очереди.
- **[`index.tsx`](src/soundboardHotkeys/index.tsx)** (renderer) — единственное место, где
  доступны сторы Discord и REST-клиент. Сопоставляет комбинацию со звуком и проигрывает.

Renderer забирает очередь main-процесса по таймеру, потому что Vencord предоставляет
плагинам только invoke-style запрос/ответ — у main нет канала, чтобы отправить событие в
renderer.

### Проигрывание звука — это два вызова, а не один

Полезно знать, если делаете что-то похожее: этого нет ни в какой документации. Кнопка
звуковой панели Discord делает **два** действия:

1. `POST /channels/{id}/send-soundboard-sound` — рассылает эмодзи и сообщает серверу;
2. внутренний диспатч `GUILD_SOUNDBOARD_SOUND_PLAY_LOCALLY` — **именно он производит
   звук**.

Если сделать только POST, запрос вернёт `204`, эмодзи увидят все, а звука не услышит
никто. Поля `emoji_id` / `emoji_name` формально необязательны, но без них происходит
ровно то же самое.

`204` от этого эндпоинта означает «принято», а не «проиграно».

## Разработка

```bash
npx tsc --noEmit -p tsconfig.json
pnpm build
```

Тестирование только ручное — см. [docs/TESTING.md](docs/TESTING.md). Автотесты здесь
бессмысленны: все задействованные API существуют только внутри запущенного клиента
Discord.

Вклад приветствуется — см. [CONTRIBUTING.md](CONTRIBUTING.md).

## Лицензия

[GPL-3.0-or-later](LICENSE), как у Vencord.

---

<details>
<summary><b>🇬🇧 English version</b> — click to expand</summary>

<br>

## Why

Discord's soundboard only responds to a click in the UI. In the case that actually
matters — you are in a game, Discord is minimised — that means alt-tabbing out to press a
button. This plugin closes that gap.

## Features

- **Truly global hotkeys.** Registered in Electron's main process via `globalShortcut`,
  so they fire while Discord is minimised or a game has focus.
- **Native soundboard.** Plays through Discord's own soundboard, so everyone in the voice
  channel hears it — not just you.
- **Two ways to bind.** Right-click a sound → *Assign hotkey*, or pick it from a
  searchable list in the plugin settings.
- **Record by pressing.** Click the key button, press your combination. Escape cancels.
- **Readable keys.** Shown as `Alt + Num1`, not `Alt+num1`.
- **English and Russian.** Follows your Discord language automatically.
- **Honest failures.** Not in a voice channel, muted, rate-limited, or the combination is
  already owned by another app — each says so instead of failing silently.

## Requirements

| | |
|---|---|
| Discord | **Desktop app.** Global hotkeys cannot exist in a browser |
| [Node.js](https://nodejs.org) | 18 or newer |
| [pnpm](https://pnpm.io) | `npm i -g pnpm` |
| [Git](https://git-scm.com) | any recent version |

## Installation

Three ways, easiest first.

> **Why is there no "just drop in one file"?**
> Vencord plugins are compiled together with the client — a standalone installer file
> does not exist in Vencord at all. On top of that, global hotkeys need Electron's
> `globalShortcut`, reachable only through a `native.ts` file, which is bundled **only
> when Vencord is built from source**. That is the price of the feature.
>
> *(`apk` is an Android package format, unrelated to Discord. A single `.plugin.js` file
> is BetterDiscord — a different client mod.)*

### Option 1 — venpm (easiest)

[venpm](https://venpm.dev) is a package manager for Vencord plugins. Two commands:

```bash
npm install -g @kamaras/venpm

venpm repo add https://github.com/GriffTanen/vc-soundboard-hotkeys/releases/latest/download/plugins.json --name soundboard-hotkeys
venpm install soundboardHotkeys
venpm rebuild
```

Then restart Discord and enable the plugin (Steps 6–7 below).

### Option 2 — release archive (no git)

Download `soundboardHotkeys.zip` from
[Releases](https://github.com/GriffTanen/vc-soundboard-hotkeys/releases/latest), unpack
the `soundboardHotkeys` folder into `<Vencord>/src/userplugins/`, then run `pnpm build`
and restart Discord.

### Option 3 — manual, step by step

### Step 1 — Check your tools

```bash
node --version   # v18.0.0 or higher
pnpm --version   # any version
git --version    # any version
```

If any command is "not found", install it from the table above and reopen your terminal.

### Step 2 — Get the Vencord source

Pick a folder you will keep — you need it again for every update.

```bash
git clone https://github.com/Vendicated/Vencord
cd Vencord
pnpm install --frozen-lockfile
```

The last command downloads dependencies and takes a minute or two.

### Step 3 — Add the plugin

From inside the `Vencord` folder:

```bash
mkdir -p src/userplugins
git clone https://github.com/GriffTanen/vc-soundboard-hotkeys src/userplugins/_shk
mv src/userplugins/_shk/src/soundboardHotkeys src/userplugins/soundboardHotkeys
rm -rf src/userplugins/_shk
```

Verify — the folder must contain exactly these five files:

```bash
ls src/userplugins/soundboardHotkeys
# HotkeyRecorder.tsx  i18n.ts  index.tsx  native.ts  types.ts
```

> Never leave an **empty** folder inside `src/userplugins` — Vencord fails to compile.

### Step 4 — Build

```bash
pnpm build
```

Finishes with a list of generated files. Any error here means Step 3 went wrong.

### Step 5 — Install into Discord

```bash
pnpm inject
```

Choose your Discord installation when asked.

### Step 6 — Restart Discord completely

Closing the window is **not** enough — Discord keeps running in the tray.
Right-click the tray icon → *Quit Discord*, then start it again.

### Step 7 — Enable the plugin

**User Settings → Vencord → Plugins → SoundboardHotkeys** → turn it on.

If it is not in the list, Step 4 or Step 5 did not finish — repeat them.

## Usage

### Bind a hotkey

Two ways, whichever suits you:

- **From the settings window** — open the plugin's cog, pick a sound in *Add a sound*,
  then press the combination you want.
- **From the soundboard** — right-click any sound → **Assign hotkey**, then press the
  combination.

![Assign hotkey from the soundboard context menu](docs/img/context-menu.png)

### Play it

Join a voice channel and press the key. It works with Discord minimised, and with a
fullscreen game in focus — that is the whole point.

### Choosing combinations

While Discord runs, a registered combination is **captured system-wide** — other
applications will not receive it. Prefer rare combinations such as `Alt+Num1`, and avoid
anything your game or OS already uses.

Nothing is bound by default, deliberately.

## Updating

From the `Vencord` folder:

```bash
cd src/userplugins/soundboardHotkeys
git pull            # only if you kept it as a git clone
cd ../../..
pnpm build
```

Restart Discord afterwards.

## Uninstalling

```bash
rm -rf src/userplugins/soundboardHotkeys
pnpm build
```

To remove Vencord entirely, run `pnpm uninject`.

## Troubleshooting

| Symptom | Cause |
|---|---|
| Plugin missing from the list | Build or inject did not finish — redo Steps 4–6 |
| Hotkey does nothing | Combination is taken by another app; the plugin says so in a toast. Pick another |
| "Join a voice channel" toast | Soundboard only works inside a voice channel |
| Nothing happens while muted | Discord blocks the soundboard when muted or deafened |
| Works focused, not minimised | Vencord was not built from source — see the note above Step 1 |

## Limitations

Discord's rules, not the plugin's:

- You must be in a voice channel, and not muted, deafened, or suppressed.
- Requires `SPEAK` + `USE_SOUNDBOARD` (and `USE_EXTERNAL_SOUNDS` for sounds from another
  server).
- Roughly a 5-second cooldown between sounds.

Plugin-specific:

- Presses are polled every 100ms, since Vencord gives plugins no way to receive pushed
  IPC events. Expect up to ~100ms of latency.
- Desktop only.

## How it works

Two Electron processes, because neither half can do the job alone:

- **[`native.ts`](src/soundboardHotkeys/native.ts)** (main process) — the only place
  `globalShortcut` exists. Registers combinations and queues presses.
- **[`index.tsx`](src/soundboardHotkeys/index.tsx)** (renderer) — the only place
  Discord's stores and REST client exist. Maps a combination to a sound and plays it.

The renderer drains the main process's queue on a timer, because Vencord exposes only
invoke-style request/response to plugins — main has no channel to push events into the
renderer.

### Playing a sound takes two calls, not one

Worth knowing if you are building something similar, because it is documented nowhere.
Discord's own soundboard button does **two** things:

1. `POST /channels/{id}/send-soundboard-sound` — broadcasts the emoji and tells the
   server;
2. an internal `GUILD_SOUNDBOARD_SOUND_PLAY_LOCALLY` dispatch — **this is what actually
   produces audio**.

With only the POST, the request returns `204`, the emoji appears for everyone, and nobody
hears a thing. The `emoji_id` / `emoji_name` fields are undocumented as required but
behave the same way when omitted.

`204` from that endpoint means "accepted", not "played".

## Development

```bash
npx tsc --noEmit -p tsconfig.json
pnpm build
```

Testing is manual — see [docs/TESTING.md](docs/TESTING.md). Automated tests are not
meaningful here: every API involved only exists inside a running Discord client.

Contributions welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[GPL-3.0-or-later](LICENSE), matching Vencord.

</details>
