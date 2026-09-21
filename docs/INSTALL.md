# Installation

> The [README](../README.md) has a friendlier walkthrough in Russian and English,
> including the one-command [venpm](https://venpm.dev) route. This page is the terse
> reference for the manual build.

## Quickest route: venpm

```bash
npm install -g @kamaras/venpm
venpm repo add https://github.com/GriffTanen/vc-soundboard-hotkeys/releases/latest/download/plugins.json --name soundboard-hotkeys
venpm install soundboardHotkeys
venpm rebuild
```

Everything below is the manual equivalent.

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

## Troubleshooting

**The plugin — and all of Vencord — silently disappeared from Discord settings.**

Discord's updater installs each new version into a fresh `app-<version>` folder and
does not carry the Vencord injection over, so an update quietly leaves you on a
vanilla client. Vencord repatches itself on quit, but only when it was injected as
an asar, and only if Discord exits normally.

Check the newest `app-*` folder for the injection — on Windows,
`%LOCALAPPDATA%\Discord\app-<version>\resources\`. An asar install keeps Discord's
original as `_app.asar` and replaces `app.asar` with a small loader pointing at your
`patcher.js`; a folder install uses an `app\` folder instead. Note that `_app.asar`
alone proves nothing: if the loader is gone, Discord starts vanilla.

To fix it: fully quit Discord (from the tray — closing the window is not enough),
run `pnpm inject` in your Vencord directory, and start Discord again. Your bindings
are stored separately and survive this.

## Uninstalling

Remove the folder from `src/userplugins`, run `pnpm build`, and restart Discord.
To remove Vencord entirely, run `pnpm uninject`.
