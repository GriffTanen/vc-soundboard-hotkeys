/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/** A single "sound -> hotkey" binding. Stored in plugin settings (renderer side only). */
export interface SoundBinding {
    /** Discord soundboard sound id. */
    soundId: string;
    /** Guild the sound belongs to. null for Discord's built-in default sounds. */
    guildId: string | null;
    /** Display name, shown in the settings list. */
    name: string;
    /**
     * The sound's emoji. Discord's own client always sends these, and the
     * sound is silently dropped (204, no audio) when they are missing.
     */
    emojiId: string | null;
    emojiName: string | null;
    /** Electron accelerator, e.g. "Control+Alt+1". */
    accelerator: string;
}

/** Result of asking the main process to register a set of accelerators. */
export interface RegisterResult {
    /** Accelerators Electron refused to register (already taken by another app). */
    failed: string[];
}
