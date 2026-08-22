# Where to share this plugin

Notes for the maintainer. Not part of the user documentation.

## Read this first

**The official Vencord repository is off-limits for us.** Their `CONTRIBUTING.md` says:

> "Your contribution must be majority human written! [...] do not use AI to generate your
> pull request description, README.md or in communication. Ignoring this rule will lead
> to a permanent block."

This plugin was written with an AI assistant, so opening a PR there risks a permanent
block on the account. Two consequences:

1. No PR to `Vendicated/Vencord`.
2. **In Vencord's own Discord server, write in your own words.** The drafts below are
   raw material to rewrite, not text to paste there. Reddit and unrelated servers have no
   such rule.

Also worth knowing: a comparable plugin, **KeybindMute** (PR #3333), was rejected in
April 2025 as "very niche". Even without the AI rule, acceptance was unlikely.

## What we have going for us

- **No competition.** Nothing on vencord.dev/plugins does soundboard hotkeys. The closest
  are `QuickReply` and `WebKeybinds`, both unrelated.
- **Proven demand.** Vencord issue [#655](https://github.com/Vendicated/Vencord/issues/655)
  (Keybind API, open since 2023), Vesktop issue
  [#18](https://github.com/Vencord/Vesktop/issues/18) (Custom Keybinds), and closed PR
  [#3614](https://github.com/Vendicated/Vencord/pull/3614). People have asked for years.
- **Realistic ceiling.** Popular userplugin repos sit at 16–117 stars. Not thousands.

## Where to post, best first

| # | Place | What to do | Expect |
|---|---|---|---|
| 1 | **Vencord Discord** (~148k members), userplugin channels | Show it, in your own words. Read the channel rules first | Most of your first users |
| 2 | **Issue #655**, **Vesktop #18** | One comment: you built this as a userplugin, here is the link | The people who literally asked for it |
| 3 | **venpm** | Already supported. Put the install command in every post | Drops setup to two commands |
| 4 | **r/discordapp** and similar | Post with the GIF. Check each subreddit's self-promotion rule | One-off spike |
| 5 | [`ScattrdBlade/pluginRepo`](https://github.com/ScattrdBlade/pluginRepo) | Ask to be listed — it is a plugin browser inside Discord | Small but on-target |
| 6 | Russian-speaking Discord/Telegram modding communities | Post in Russian | Less crowded niche |

Do not post the same text everywhere on the same day. Space it out, and answer whatever
comes back — the first questions tell you what the README failed to explain.

## Drafts

Rewrite before posting, especially for #1.

### Short, for a Discord channel (English)

> Discord's soundboard only works if you click the button, which is useless mid-game.
> I made a Vencord userplugin that binds global hotkeys to it — press the key in a
> fullscreen game and the sound plays into the voice channel for everyone.
>
> Needs Vencord built from source (global hotkeys need `native.ts`). With venpm it's:
> `venpm install soundboardHotkeys`
>
> https://github.com/GriffTanen/vc-soundboard-hotkeys

### Short, for a Discord channel (Russian)

> Звуковая панель Discord работает только кликом по кнопке — в игре это бесполезно.
> Сделал userplugin для Vencord: вешает на звуки глобальные хоткеи. Жмёшь клавишу в
> полноэкранной игре, звук уходит в голосовой канал и его слышат все.
>
> Нужен Vencord, собранный из исходников (глобальные хоткеи требуют `native.ts`).
> Через venpm — одна команда: `venpm install soundboardHotkeys`
>
> https://github.com/GriffTanen/vc-soundboard-hotkeys

### Reddit post (English)

> **Title:** I made a Vencord plugin that gives Discord's soundboard global hotkeys
>
> Discord's soundboard only responds to a click in the UI. In the one situation where I
> actually wanted it — mid-game, Discord minimised — that meant alt-tabbing out, which
> defeats the point.
>
> So the plugin registers the hotkeys in Electron's main process. Press the key while a
> fullscreen game has focus and the sound plays into the voice channel; everyone hears
> it, not just you.
>
> Bind by right-clicking a sound, or from a searchable list in the settings. English and
> Russian, following your Discord language.
>
> The catch: it needs Vencord built from source, because global hotkeys are only
> reachable from a plugin's `native.ts`, which prebuilt installs do not bundle.
>
> One thing I learned that is documented nowhere: the REST endpoint alone does not play
> anything. Discord's own button also fires an internal `GUILD_SOUNDBOARD_SOUND_PLAY_LOCALLY`
> dispatch, and that is what makes sound. With only the POST you get a 204, the emoji
> shows up for everyone, and there is silence.
>
> https://github.com/GriffTanen/vc-soundboard-hotkeys

### One-liner, for a relevant issue thread

> For anyone still looking for this: I built it as a Vencord userplugin — global hotkeys
> for the native soundboard, via `globalShortcut` in `native.ts`.
> https://github.com/GriffTanen/vc-soundboard-hotkeys

## Claims to keep straight

Say the true thing, or the first reply will correct you:

- It gives the **native soundboard** hotkeys. It is not a soundboard replacement and does
  not play your own audio files.
- It needs **Vencord built from source**. Say it up front — burying it wastes people's
  time and earns bad comments.
- Hotkeys are **captured system-wide** while Discord runs; other apps stop receiving them.
- Desktop only.
