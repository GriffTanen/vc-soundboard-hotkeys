# Installation

> A friendlier step-by-step version lives in the [README](../README.md#installation)
> ([по-русски](../README.ru.md#установка)). This page is the terse reference.

The plugin needs Electron's `globalShortcut`, which only exists in the main
process. Vencord reaches it through a plugin's `native.ts`, and that file is only
bundled when Vencord is **built from source**. There is no way to get global
hotkeys from a prebuilt install — that is the price of the feature.

## Requirements

- [Node.js](https://nodejs.org) 18+
- [pnpm](https://pnpm.io) (`npm i -g pnpm`)
- [Git](https://git-scm.com)

## 1. Build Vencord from source

```bash
git clone https://github.com/Vendicated/Vencord
cd Vencord
pnpm install --frozen-lockfile
```

## 2. Add the plugin

```bash
mkdir -p src/userplugins
git clone https://github.com/GriffTanen/vc-soundboard-hotkeys src/userplugins/_shk
mv src/userplugins/_shk/src/soundboardHotkeys src/userplugins/soundboardHotkeys
rm -rf src/userplugins/_shk
```

Or copy `src/soundboardHotkeys/` into `<Vencord>/src/userplugins/` by hand.

The folder must contain `index.tsx`, `native.ts`, `HotkeyRecorder.tsx`, `i18n.ts`, `types.ts`.

> Do not leave an empty folder in `src/userplugins` — Vencord fails to compile.

## 3. Build and inject

```bash
pnpm build
pnpm inject
```

Pick your Discord install when prompted, then **fully restart Discord**
(quit from the tray — closing the window is not enough).

## 4. Enable

Settings → Vencord → Plugins → **SoundboardHotkeys** → enable.

## Usage

1. Join a voice channel and open the soundboard.
2. Right-click a sound → **Assign hotkey**.
3. Open the plugin settings, click the button next to the sound, press your
   combination (Esc cancels).

Hotkeys now fire system-wide, including from a fullscreen game.

## Choosing combinations

While Discord runs, a registered combination is **captured system-wide** and other
applications will not receive it. Prefer rare combinations such as
`Control+Alt+1` and avoid anything your game or OS already uses.

No hotkeys are bound by default, precisely for this reason.

## Updating

Re-copy the plugin folder, then `pnpm build` and restart Discord.

## Uninstalling

Remove the folder from `src/userplugins`, run `pnpm build`, and restart Discord.
To remove Vencord entirely, run `pnpm uninject`.
