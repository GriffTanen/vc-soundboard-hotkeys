# SoundboardHotkeys

A [Vencord](https://vencord.dev) userplugin that binds **global hotkeys** to Discord's
native soundboard.

Press `Ctrl+Alt+1` without leaving your fullscreen game — the sound plays into the voice
channel and **everyone hears it**.

## Why

Discord's soundboard only responds to a click in the UI. In the case that actually matters —
you are in a game, Discord is minimised — that means alt-tabbing out to press a button.
This plugin closes that gap.

## Features

- **Truly global hotkeys.** Registered in Electron's main process via `globalShortcut`, so
  they fire while Discord is minimised or a game has focus.
- **Native soundboard.** Plays through Discord's own soundboard, so everyone in the voice
  channel hears it — not just you.
- **Bind from the soundboard.** Right-click any sound → *Assign hotkey*.
- **Record by pressing.** Click the button, press your combination. Escape cancels.
- **Honest failures.** Not in a voice channel, muted, rate-limited, or the combination is
  already owned by another app — each says so instead of failing silently.

## Installation

Global hotkeys need Electron's `globalShortcut`, which is only reachable from a plugin's
`native.ts`, and that file is only bundled when **Vencord is built from source**. There is
no way to get this from a prebuilt install.

Full walkthrough: [docs/INSTALL.md](docs/INSTALL.md).

```bash
git clone https://github.com/Vendicated/Vencord
cd Vencord
pnpm install --frozen-lockfile
mkdir -p src/userplugins
# copy src/soundboardHotkeys/ from this repo into src/userplugins/
pnpm build
pnpm inject
```

Restart Discord fully (quit from the tray), then enable **SoundboardHotkeys** in
Settings → Vencord → Plugins.

## Usage

1. Join a voice channel and open the soundboard.
2. Right-click a sound → **Assign hotkey**.
3. In the plugin settings, click the button next to the sound and press your combination.

## Choosing combinations

While Discord is running, a registered combination is **captured system-wide** — other
applications will not receive it. Prefer rare combinations like `Ctrl+Alt+1`, and avoid
anything your game or OS already uses.

Nothing is bound by default, deliberately.

## Limitations

These are Discord's rules, not the plugin's:

- You must be in a voice channel, and not muted, deafened, or suppressed.
- Requires `SPEAK` + `USE_SOUNDBOARD` (and `USE_EXTERNAL_SOUNDS` for sounds from another
  server).
- Roughly a 5-second cooldown between sounds.

Plugin-specific:

- Presses are polled every 100ms, since Vencord gives plugins no way to receive pushed IPC
  events. Expect up to ~100ms of latency.
- Desktop only. Global hotkeys cannot exist in a browser.

## How it works

Two Electron processes, because neither half can do the job alone:

- **`native.ts`** (main process) — the only place `globalShortcut` exists. Registers the
  combinations and queues presses.
- **`index.tsx`** (renderer) — the only place Discord's stores and REST client exist. Maps
  a combination to a sound and sends it.

The renderer drains the main process's press queue on a timer. It works this way because
Vencord exposes only invoke-style request/response to plugins — the main process has no
channel to push an event into the renderer.

Sounds are sent with `POST /channels/{id}/send-soundboard-sound`.

## Development

Verified against Vencord `main`:

```bash
npx tsc --noEmit -p tsconfig.json   # 0 errors
npx eslint src/userplugins/soundboardHotkeys
pnpm build
```

Testing is manual — see [docs/TESTING.md](docs/TESTING.md). Automated tests are not
meaningful here, since every API involved only exists inside a running Discord client.

## License

[GPL-3.0-or-later](LICENSE), matching Vencord.
