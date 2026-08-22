# SoundboardHotkeys — Vencord userplugin

Плагин для Vencord, назначающий **глобальные** хоткеи на звуки нативной звуковой панели
Discord. Нажал `Ctrl+Alt+1` не выходя из полноэкранной игры → звук ушёл в голосовой канал,
его слышат все участники.

## Зачем

Нативная soundboard Discord запускается только кликом по кнопке в UI. В главном сценарии
(ты в игре, Discord свёрнут) это бесполезно — надо альт-табнуться. Плагин закрывает
именно этот разрыв.

## Стек

- TypeScript (strict, без `any`), React — как userplugin внутри Vencord.
- Собирается вместе с Vencord из исходников (`git` + `node` + `pnpm`).
- Лицензия GPL-3.0 — обязательна, т.к. Vencord под GPL-3.0.

## Архитектура

Два процесса Electron, связанные через IPC:

- `src/soundboardHotkeys/native.ts` — **main-процесс**. Только здесь доступен
  `globalShortcut`. Регистрирует комбинации, шлёт событие в renderer при нажатии.
- `src/soundboardHotkeys/index.tsx` — **renderer**. Только здесь доступны сторы Discord и
  REST-клиент. Хранит настройки, сопоставляет комбинацию → звук, отправляет звук.

Ни одна половина не может выполнить задачу целиком — отсюда разделение.

Сопоставление «комбинация → звук» живёт **только в renderer**. Main знает лишь список
акселераторов.

## Ключевые технические факты

Проверено по исходникам Vencord и докам Discord — не переоткрывать заново:

- **Встроенного keybind API в Vencord нет.** PR #3614 (`keybindManager`) закрыт,
  issue #655 висит открытым с 2023. Единственный путь к глобальным хоткеям —
  `globalShortcut` из `native.ts`.
- **`OptionType` не содержит KEYBIND** (только STRING/NUMBER/BIGINT/BOOLEAN/SELECT/
  SLIDER/COMPONENT/CUSTOM). UI записи хоткея пишем сами через `OptionType.COMPONENT`.
- **`PluginNative`**: первым аргументом каждой native-функции идёт
  `Electron.IpcMainInvokeEvent`; на стороне renderer этот аргумент исчезает, а результат
  всегда `Promise`.
- **Отправка звука**: `POST /channels/{channel.id}/send-soundboard-sound`,
  body `{ sound_id, source_guild_id? }`.
- **Ограничения Discord**: нужен голосовой канал; юзер не в mute/deaf/suppress; права
  `SPEAK` + `USE_SOUNDBOARD` (+ `USE_EXTERNAL_SOUNDS` для звуков с чужого сервера);
  кулдаун ~5 сек.
- **`contextMenus`** — поле `Record<string, NavContextMenuPatchCallback>` в `PluginDef`.

## Правила

- Все webpack-находки (`findByPropsLazy`, `findStoreLazy`) — изолированы в одном месте,
  чтобы чинить точечно после обновлений Discord.
- Модуль не найден → **явная ошибка в лог**, не тихий фолбэк.
- Дефолтных биндов не назначаем: `globalShortcut` перехватывает комбинацию системно, и
  пока Discord запущен, она недоступна другим приложениям.
- В `stop()` обязательно снимать все хоткеи — иначе комбинация останется занятой.

## Тестирование

Только ручное в живом Discord — автотесты для client mod смысла не имеют.
Чек-лист — `docs/TESTING.md`. Главный критерий приёмки: **хоткей срабатывает при
свёрнутом Discord / в полноэкранной игре**.
