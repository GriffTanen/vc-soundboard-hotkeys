/*
 * SoundboardHotkeys, a Vencord userplugin
 * Copyright (c) 2026 GriffTanen
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { LocaleStore } from "@webpack/common";

interface Strings {
    assignHotkey: string;
    changeHotkey: string;
    removeHotkey: string;
    pressAKey: string;
    notBound: string;
    noBindings: string;
    remove: string;
    alreadyBound: string;
    conflictWithSound: string;
    unavailable: string;
    joinVoice: string;
    mutedOrDeafened: string;
    couldNotPlay: string;
    boundTo: string;
    addSound: string;
    addSoundPlaceholder: string;
    noSoundsAvailable: string;
    removeTooltip: string;
    clickToRecord: string;
}

const en: Strings = {
    assignHotkey: "Assign hotkey",
    changeHotkey: "Change hotkey",
    removeHotkey: "Remove hotkey",
    pressAKey: "Press a key… (Esc to cancel)",
    notBound: "Not bound",
    noBindings: "No hotkeys yet. Right-click a sound in the soundboard and choose \"Assign hotkey\".",
    remove: "Remove",
    alreadyBound: "already has a hotkey",
    conflictWithSound: "is already used by another sound",
    unavailable: "Hotkey unavailable (in use by another app):",
    joinVoice: "Join a voice channel to use soundboard hotkeys",
    mutedOrDeafened: "Discord blocks the soundboard while muted or deafened",
    couldNotPlay: "Could not play",
    boundTo: "bound to",
    addSound: "Add a sound",
    addSoundPlaceholder: "Pick a sound to bind…",
    noSoundsAvailable: "Every available sound already has a hotkey.",
    removeTooltip: "Remove hotkey",
    clickToRecord: "Click to set a key"
};

const ru: Strings = {
    assignHotkey: "Назначить хоткей",
    changeHotkey: "Изменить хоткей",
    removeHotkey: "Удалить хоткей",
    pressAKey: "Нажмите клавишу… (Esc — отмена)",
    notBound: "Не назначен",
    noBindings: "Хоткеев пока нет. Нажмите правой кнопкой по звуку на панели и выберите «Назначить хоткей».",
    remove: "Удалить",
    alreadyBound: "уже имеет хоткей",
    conflictWithSound: "уже занят другим звуком",
    unavailable: "Хоткей недоступен (занят другим приложением):",
    joinVoice: "Зайдите в голосовой канал, чтобы использовать хоткеи",
    mutedOrDeafened: "Discord блокирует звуковую панель при выключенном микрофоне или звуке",
    couldNotPlay: "Не удалось проиграть",
    boundTo: "назначен на",
    addSound: "Добавить звук",
    addSoundPlaceholder: "Выберите звук…",
    noSoundsAvailable: "Все доступные звуки уже имеют хоткей.",
    removeTooltip: "Удалить хоткей",
    clickToRecord: "Нажмите, чтобы задать клавишу"
};

const TRANSLATIONS: Record<string, Strings> = { en, ru };

/**
 * Strings for Discord's current language, falling back to English.
 * Read on each access so switching language in Discord takes effect without a
 * plugin restart.
 */
export function t(): Strings {
    // Discord locales look like "en-US" / "ru"; match on the language part.
    const language = LocaleStore.locale?.split("-")[0] ?? "en";
    return TRANSLATIONS[language] ?? en;
}
