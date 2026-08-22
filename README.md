# SoundboardHotkeys

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![Vencord](https://img.shields.io/badge/Vencord-userplugin-ed4245.svg)](https://vencord.dev)

A [Vencord](https://vencord.dev) userplugin that binds **global hotkeys** to Discord's
native soundboard.

Press `Ctrl+Alt+1` without leaving your fullscreen game — the sound plays into the voice
channel and **everyone hears it**.

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

- Discord **desktop** app (global hotkeys cannot exist in a browser)
- [Node.js](https://nodejs.org) 18+, [pnpm](https://pnpm.io), [Git](https://git-scm.com)

## Installation

Global hotkeys need Electron's `globalShortcut`, which is only reachable from a plugin's
`native.ts` — and that file is only bundled when **Vencord is built from source**. A
prebuilt Vencord install cannot provide this.

```bash
git clone https://github.com/Vendicated/Vencord
cd Vencord
pnpm install --frozen-lockfile

mkdir -p src/userplugins
git clone https://github.com/GriffTanen/vc-soundboard-hotkeys src/userplugins/tmp
mv src/userplugins/tmp/src/soundboardHotkeys src/userplugins/
rm -rf src/userplugins/tmp

pnpm build
pnpm inject
```

Fully restart Discord (quit from the tray — closing the window is not enough), then
enable **SoundboardHotkeys** in Settings → Vencord → Plugins.

Step-by-step walkthrough: [docs/INSTALL.md](docs/INSTALL.md).

## Usage

1. Join a voice channel.
2. Open the plugin settings and pick a sound from **Add a sound** — or right-click any
   sound in the soundboard and choose **Assign hotkey**.
3. Press the key combination you want. That's it.

### Choosing combinations

While Discord is running, a registered combination is **captured system-wide** — other
applications will not receive it. Prefer rare combinations like `Ctrl+Alt+1`, and avoid
anything your game or OS already uses.

Nothing is bound by default, deliberately.

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

Worth knowing if you are writing something similar, because it is not documented
anywhere. Discord's own soundboard button does **two** things:

1. `POST /channels/{id}/send-soundboard-sound` — broadcasts the emoji and tells the
   server;
2. an internal `GUILD_SOUNDBOARD_SOUND_PLAY_LOCALLY` dispatch — **this is what actually
   produces audio**.

With only the POST, the request returns `204`, the emoji appears for everyone, and nobody
hears a thing. The `emoji_id` / `emoji_name` fields are undocumented as required but
behave the same way if omitted.

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
