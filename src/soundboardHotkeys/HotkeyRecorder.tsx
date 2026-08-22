/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Button, React } from "@webpack/common";

/** Keys that only act as modifiers — never a binding on their own. */
const MODIFIER_CODES = new Set([
    "ControlLeft", "ControlRight",
    "ShiftLeft", "ShiftRight",
    "AltLeft", "AltRight",
    "MetaLeft", "MetaRight"
]);

/**
 * Translate a KeyboardEvent into an Electron accelerator ("Control+Alt+1").
 * Uses `code` rather than `key`, so the binding does not shift with the
 * keyboard layout or with which modifiers are held.
 * Returns null while only modifiers are down.
 */
export function toAccelerator(event: KeyboardEvent): string | null {
    if (MODIFIER_CODES.has(event.code)) return null;

    const parts: string[] = [];
    if (event.ctrlKey) parts.push("Control");
    if (event.shiftKey) parts.push("Shift");
    if (event.altKey) parts.push("Alt");
    if (event.metaKey) parts.push("Super");

    const { code } = event;
    let key: string;

    if (code.startsWith("Key")) key = code.slice(3);
    else if (code.startsWith("Digit")) key = code.slice(5);
    else if (code.startsWith("Numpad")) key = `num${code.slice(6).toLowerCase()}`;
    else if (/^F\d{1,2}$/.test(code)) key = code;
    else if (code === "Space") key = "Space";
    else if (code === "Backquote") key = "`";
    else if (code === "Minus") key = "-";
    else if (code === "Equal") key = "=";
    else if (code === "BracketLeft") key = "[";
    else if (code === "BracketRight") key = "]";
    else if (code === "Semicolon") key = ";";
    else if (code === "Quote") key = "'";
    else if (code === "Comma") key = ",";
    else if (code === "Period") key = ".";
    else if (code === "Slash") key = "/";
    else if (code === "Backslash") key = "\\";
    else return null;

    parts.push(key);
    return parts.join("+");
}

export interface HotkeyRecorderProps {
    /** Current accelerator, or null when unbound. */
    value: string | null;
    /** Called with the newly recorded accelerator. */
    onChange: (accelerator: string) => void;
}

/**
 * Click to record, then press a combination. Escape cancels.
 * Captures at the document level so Discord's own shortcuts do not swallow the keys.
 */
export function HotkeyRecorder({ value, onChange }: HotkeyRecorderProps) {
    const [recording, setRecording] = React.useState(false);

    React.useEffect(() => {
        if (!recording) return;

        function onKeyDown(event: KeyboardEvent) {
            event.preventDefault();
            event.stopPropagation();

            if (event.code === "Escape") {
                setRecording(false);
                return;
            }

            const accelerator = toAccelerator(event);
            if (accelerator === null) return;

            onChange(accelerator);
            setRecording(false);
        }

        document.addEventListener("keydown", onKeyDown, true);
        return () => document.removeEventListener("keydown", onKeyDown, true);
    }, [recording, onChange]);

    return (
        <Button
            size={Button.Sizes.SMALL}
            color={recording ? Button.Colors.BRAND : Button.Colors.PRIMARY}
            onClick={() => setRecording(r => !r)}
        >
            {recording ? "Press a key… (Esc to cancel)" : value ?? "Not bound"}
        </Button>
    );
}
