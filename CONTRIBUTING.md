# Contributing

Issues and pull requests are welcome.

## Getting set up

The plugin cannot run on its own — it needs a Vencord tree built from source, because
`native.ts` (where the global hotkeys live) is only bundled that way. Full setup:
[docs/INSTALL.md](docs/INSTALL.md).

Working copy layout:

```
Vencord/
  src/userplugins/soundboardHotkeys/   <- this repo's src/soundboardHotkeys
```

## Before opening a pull request

```bash
npx tsc --noEmit -p tsconfig.json   # must be 0 errors
pnpm build                          # must succeed
```

Then load it in a real Discord client and walk through
[docs/TESTING.md](docs/TESTING.md) — at minimum the acceptance case: **a hotkey fires
while Discord is minimised, and a second person in the voice channel hears the sound.**

There are no automated tests, and adding them would not help: every API this plugin
touches (`globalShortcut`, Discord's stores, its REST client) only exists inside a
running Electron client.

## Things worth knowing

- **Webpack lookups are deliberately isolated.** Everything the plugin pulls out of
  Discord's internals sits at the top of `index.tsx`. When a Discord update breaks
  something, that is the first place to look — please keep new lookups there rather than
  scattering them.
- **Fail loudly.** If a module is missing or a sound cannot play, log it and tell the
  user. No silent fallbacks — a soundboard that quietly does nothing is the exact bug
  this plugin already had once.
- **No default keybinds.** `globalShortcut` captures a combination system-wide, so
  shipping defaults would steal keys from other applications.
- **Storage format is Electron's.** Accelerators are stored exactly as `globalShortcut`
  expects (`Alt+num1`) and only prettified for display. Changing the stored format
  breaks every existing binding.

## Style

Match the surrounding code: TypeScript strict, no `any`, imports at the top, and
comments that explain *why* rather than restating the line below.

## License

By contributing you agree your work is licensed under
[GPL-3.0-or-later](LICENSE), matching Vencord.
