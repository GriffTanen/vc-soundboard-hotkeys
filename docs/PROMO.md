# Getting this plugin in front of people

Notes for the maintainer. Not part of the user documentation.

## Read this first

**The official Vencord repository is off-limits for us.** Their `CONTRIBUTING.md` says:

> "Your contribution must be majority human written! [...] do not use AI to generate your
> pull request description, README.md or in communication. Ignoring this rule will lead
> to a permanent block."

This plugin was written with an AI assistant, so opening a PR there risks a permanent
block on the account. Two consequences:

1. No PR to `Vendicated/Vencord`.
2. **In Vencord's own Discord server, write in your own words.** The drafts below are raw
   material to rewrite, not text to paste there. Reddit and unrelated servers have no
   such rule.

Also worth knowing: a comparable plugin, **KeybindMute** (PR #3333), was rejected in April
2025 as "very niche". Even without the AI rule, acceptance was unlikely.

## What is automated, and what is not

Automated (nothing to do):

- **Releases** — push a tag, CI validates the manifest, builds the zip, writes install
  instructions into the release notes.
- **Traffic log** — `docs/METRICS.md` gets a row every Monday. Referrers show which post
  actually brought people. GitHub only keeps 14 days, so this file is the only history.
- **First reply to issues** — posted within a minute, asks for the details most reports
  omit.

**Not automatable, by design.** Automating a Discord *user* account is a
[ToS violation with a permanent ban](https://support.discord.com/hc/en-us/articles/115002192352-Automated-User-Accounts-Self-Bots),
and it would be the same account you play on. Reddit bans bot self-promotion. Every
channel with real volume is deliberately human-gated. Posting is a one-time manual job of
about twenty minutes.

## Reality check

- **Nothing brings visitors on its own.** As of 23 Aug 2026 the repo had 0 views, 0
  clones, 0 referrers. GitHub topic pages sort by stars — at zero stars we appear on no
  page of results. The first inbound link has to be placed by a person.
- **venpm does not bring anyone.** `venpm search` only searches repositories the user
  already added (`config.repos` in its source). There is no central index. It shortens
  *installation* for people who already found us; it is not a discovery channel.
- **Realistic ceiling: 10–30 stars.** Legitimate utility plugins in the `vencord-plugin`
  topic sit there (FakeDeafen 29, base64-decoder 20, messageScheduler 16). The 70–117 star
  repos are nitro snipers — a different, larger, and less scrupulous audience.

## What we have going for us

- **No competition.** Nothing on vencord.dev/plugins does soundboard hotkeys. The closest
  are `QuickReply` and `WebKeybinds`, both unrelated.
- **Proven demand.** Vencord issue [#655](https://github.com/Vendicated/Vencord/issues/655)
  (Keybind API, open since 2023), Vesktop issue
  [#18](https://github.com/Vencord/Vesktop/issues/18) (Custom Keybinds), and closed PR
  [#3614](https://github.com/Vendicated/Vencord/pull/3614). People have asked for years.

## Where to post, best first

| # | Place | What to do | Expect |
|---|---|---|---|
| 1 | Issue [#655](https://github.com/Vendicated/Vencord/issues/655), Vesktop [#18](https://github.com/Vencord/Vesktop/issues/18) | One comment: you built this as a userplugin | The people who literally asked for it |
| 2 | **Vencord Discord**, userplugin channels | Post in your own words; read the channel rules first | Most of your first users |
| 3 | **r/discordapp** and similar | Post; check the subreddit's self-promotion rule first — many require a weekly megathread | One-off spike |
| 4 | Russian-speaking Discord/Telegram modding communities | Post in Russian | Less crowded niche |

Do not post everywhere on the same day. Space it out, check `docs/METRICS.md` a week
later, and put further effort only into whatever actually showed up in referrers.

Answer whatever comes back — the first questions tell you what the README failed to
explain.

## Drafts

Rewrite before posting, especially for #1 and #2.

### Comment for an issue thread (English)

> For anyone still looking for this: I built it as a Vencord userplugin — global hotkeys
> for the native soundboard, registered through `globalShortcut` in `native.ts`, so they
> fire while Discord is minimised or a game has focus.
>
> https://github.com/GriffTanen/vc-soundboard-hotkeys

### Short, for a Discord channel (English)

> Discord's soundboard only works if you click the button, which is useless mid-game.
> I made a Vencord userplugin that binds global hotkeys to it — press the key in a
> fullscreen game and the sound plays into the voice channel for everyone.
>
> Needs Vencord built from source (global hotkeys need `native.ts`).
>
> https://github.com/GriffTanen/vc-soundboard-hotkeys

### Short, for a Discord channel (Russian)

> Звуковая панель Discord работает только кликом по кнопке — в игре это бесполезно.
> Сделал userplugin для Vencord: вешает на звуки глобальные хоткеи. Жмёшь клавишу в
> полноэкранной игре, звук уходит в голосовой канал и его слышат все.
>
> Нужен Vencord, собранный из исходников (глобальные хоткеи требуют `native.ts`).
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
> fullscreen game has focus and the sound plays into the voice channel; everyone hears it,
> not just you.
>
> Bind by right-clicking a sound, or from a searchable list in the settings. English and
> Russian, following your Discord language.
>
> The catch: it needs Vencord built from source, because global hotkeys are only reachable
> from a plugin's `native.ts`, which prebuilt installs do not bundle.
>
> One thing I learned that is documented nowhere: the REST endpoint alone does not play
> anything. Discord's own button also fires an internal
> `GUILD_SOUNDBOARD_SOUND_PLAY_LOCALLY` dispatch, and that is what makes sound. With only
> the POST you get a 204, the emoji shows up for everyone, and there is silence.
>
> https://github.com/GriffTanen/vc-soundboard-hotkeys

The `PLAY_LOCALLY` detail is the strongest thing we have for a developer audience — it is
knowledge that exists nowhere else, and it is a reason for someone to link the repo.

## Claims to keep straight

Say the true thing, or the first reply will correct you:

- It gives the **native soundboard** hotkeys. It is not a soundboard replacement and does
  not play your own audio files.
- It needs **Vencord built from source**. Say it up front — burying it wastes people's
  time and earns bad comments.
- Hotkeys are **captured system-wide** while Discord runs; other apps stop receiving them.
- Desktop only.
