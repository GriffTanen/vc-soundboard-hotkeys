# Testing checklist

Manual only — automated tests make no sense for a Discord client mod, since every
API it touches lives inside a running Electron client.

Requires: a second account or a friend in the voice channel to confirm others
actually hear the sound.

## Step 0 — recon (before trusting the code)

Two values in `index.tsx` are guesses about Discord internals and must be
confirmed in DevTools (Ctrl+Shift+I) against the live client:

1. **Context menu id.** Open the soundboard, right-click a sound, and find the
   `navId` of the rendered menu. Current guess: `sound-button-context`.
   If it differs, fix the key in `contextMenus`.
2. **Context menu props.** Confirm the callback's second argument really carries
   the sound id / guild id, and under which names. Adjust `SoundContextProps`.
3. **REST module.** `Vencord.Webpack.findByProps("getAPIBaseURL", "post")` —
   confirm `.post({ url, body })` is the right shape.
4. **MediaEngineStore.** Confirm `isSelfMute()` / `isSelfDeaf()` exist.

Log what each lookup actually resolved to before moving on.

## Step 1 — build

- `pnpm build` in the Vencord directory completes with no type errors.
- Restart Discord; **SoundboardHotkeys** appears in the plugin list.
- Enabling it produces no errors in the console.

## Step 2 — functional

| # | Check | Expected |
|---|---|---|
| 1 | Right-click a soundboard sound → "Assign hotkey" | Entry appears in plugin settings |
| 2 | Record a combination in settings | Saved, displayed in Electron form (`Control+Alt+1`) |
| 3 | Press the hotkey **with Discord focused**, while in a voice channel | Sound plays; others hear it |
| 4 | Press the hotkey **with Discord minimised / in a fullscreen game** | Sound plays. **Main acceptance criterion** |
| 5 | Press the hotkey while not in a voice channel | Clear toast, no silent failure |
| 6 | Bind a combination another app already owns | Flagged as unavailable in a toast |
| 7 | Bind a combination already used by another sound | Rejected with a toast |
| 8 | Disable the plugin, then press the hotkey | Nothing fires; the combination returns to the other app |
| 9 | Restart Discord | Bindings survive |
| 10 | Press the same hotkey repeatedly (~5s cooldown) | Failure toast, plugin keeps working |
| 11 | Remove a binding | Hotkey stops firing immediately |

## Step 3 — regression

After any fix, run the whole of Step 2 again — a change in the IPC or settings
layer can break a check that passed earlier.

## Known limits

- Latency: presses are polled every 100ms, so up to ~100ms delay is expected.
- Muted/deafened: Discord blocks the soundboard entirely; the plugin reports it.
- Requires `SPEAK` + `USE_SOUNDBOARD` (and `USE_EXTERNAL_SOUNDS` for sounds from
  another server).
