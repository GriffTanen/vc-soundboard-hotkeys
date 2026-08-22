/*
 * SoundboardHotkeys, a Vencord userplugin
 * Copyright (c) 2026 GriffTanen
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { globalShortcut, IpcMainInvokeEvent } from "electron";

import { RegisterResult } from "./types";

/**
 * Accelerators currently held by this plugin. The main process only knows the
 * combinations - the "combination -> sound" mapping lives in the renderer.
 */
const registered = new Set<string>();

/**
 * Accelerators fired since the renderer last drained this queue.
 *
 * Vencord exposes only invoke-based request/response to plugins - there is no
 * API for the main process to push events into the renderer - so presses are
 * queued here and the renderer drains them via takePressed().
 */
let pressed: string[] = [];

function unregister(accelerator: string): void {
    globalShortcut.unregister(accelerator);
    registered.delete(accelerator);
}

/**
 * Replace the current set of global hotkeys with `accelerators`.
 * Returns the ones Electron refused, so the renderer can flag them as
 * conflicting instead of silently pretending they work.
 */
export function registerHotkeys(
    _event: IpcMainInvokeEvent,
    accelerators: string[]
): RegisterResult {
    for (const accelerator of [...registered]) unregister(accelerator);
    pressed = [];

    const failed: string[] = [];

    for (const accelerator of accelerators) {
        // register() throws on a malformed accelerator and returns false when
        // another application already owns the combination.
        let ok: boolean;
        try {
            ok = globalShortcut.register(accelerator, () => {
                // Bound the queue: a hotkey held down while the renderer is busy
                // must not grow this without limit.
                if (pressed.length < 8) pressed.push(accelerator);
            });
        } catch {
            ok = false;
        }

        if (ok) registered.add(accelerator);
        else failed.push(accelerator);
    }

    return { failed };
}

/** Drain and return the accelerators pressed since the last call. */
export function takePressed(_event: IpcMainInvokeEvent): string[] {
    const drained = pressed;
    pressed = [];
    return drained;
}

/** Release every hotkey this plugin holds. Called from the plugin's stop(). */
export function unregisterAll(_event: IpcMainInvokeEvent): void {
    for (const accelerator of [...registered]) unregister(accelerator);
    pressed = [];
}
