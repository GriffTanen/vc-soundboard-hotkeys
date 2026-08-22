/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { HeadingSecondary } from "@components/Heading";
import { Paragraph } from "@components/Paragraph";
import { Logger } from "@utils/Logger";
import definePlugin, { OptionType, PluginNative } from "@utils/types";
import { SoundboardSound } from "@vencord/discord-types";
import {
    Button, MediaEngineStore, Menu, React, RestAPI,
    SelectedChannelStore, showToast, SoundboardStore, Toasts
} from "@webpack/common";

import { HotkeyRecorder } from "./HotkeyRecorder";
import { SoundBinding } from "./types";

const logger = new Logger("SoundboardHotkeys");

const Native = VencordNative.pluginHelpers.SoundboardHotkeys as PluginNative<
    typeof import("./native")
>;

/**
 * How often the renderer drains the main process press queue.
 * Vencord gives plugins no way to receive pushed IPC events, so polling is the
 * only option. 100ms keeps the delay below what feels laggy while staying cheap.
 */
const POLL_INTERVAL_MS = 100;

let pollTimer: number | null = null;

function readBindings(): SoundBinding[] {
    const raw = settings.store.bindings;
    if (!raw) return [];

    try {
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed as SoundBinding[];
    } catch (err) {
        logger.error("Failed to parse stored bindings", err);
        return [];
    }
}

function writeBindings(bindings: SoundBinding[]): void {
    settings.store.bindings = JSON.stringify(bindings);
}

/** Push the current accelerators to the main process and report conflicts. */
async function syncHotkeys(): Promise<void> {
    const accelerators = readBindings()
        .map(b => b.accelerator)
        .filter(a => a !== "");

    const { failed } = await Native.registerHotkeys(accelerators);

    if (failed.length > 0) {
        logger.warn("Could not register accelerators", failed);
        showToast(
            "Hotkey unavailable (in use by another app): " + failed.join(", "),
            Toasts.Type.FAILURE
        );
    }
}

/**
 * Play a soundboard sound into the voice channel the user is currently in.
 * Reports why it could not play instead of failing silently.
 */
async function playSound(binding: SoundBinding): Promise<void> {
    const channelId = SelectedChannelStore.getVoiceChannelId();

    if (!channelId) {
        showToast("Join a voice channel to use soundboard hotkeys", Toasts.Type.FAILURE);
        return;
    }

    if (MediaEngineStore.isSelfMute() || MediaEngineStore.isSelfDeaf()) {
        showToast("Discord blocks the soundboard while muted or deafened", Toasts.Type.FAILURE);
        return;
    }

    try {
        await RestAPI.post({
            url: "/channels/" + channelId + "/send-soundboard-sound",
            body: {
                sound_id: binding.soundId,
                ...(binding.guildId ? { source_guild_id: binding.guildId } : {})
            }
        });
    } catch (err) {
        // Discord enforces a ~5s per-user cooldown; 429 is the common case here.
        logger.error("Failed to send soundboard sound", err);
        showToast("Could not play " + binding.name + " (rate limited?)", Toasts.Type.FAILURE);
    }
}

/** Drain hotkey presses queued in the main process and play their sounds. */
async function pollPresses(): Promise<void> {
    const accelerators = await Native.takePressed();
    if (accelerators.length === 0) return;

    const bindings = readBindings();

    for (const accelerator of accelerators) {
        const binding = bindings.find(b => b.accelerator === accelerator);
        if (binding) await playSound(binding);
    }
}

// --- Settings UI -----------------------------------------------------------

function BindingsSettings() {
    const [bindings, setBindings] = React.useState<SoundBinding[]>(readBindings);

    function update(next: SoundBinding[]): void {
        setBindings(next);
        writeBindings(next);
        void syncHotkeys();
    }

    if (bindings.length === 0) {
        return (
            <Paragraph>
                No hotkeys yet. Right-click a sound in the soundboard and choose "Assign hotkey".
            </Paragraph>
        );
    }

    return (
        <div>
            {bindings.map((binding, index) => (
                <div key={binding.soundId} style={{ marginBottom: "12px" }}>
                    <HeadingSecondary>{binding.name}</HeadingSecondary>
                    <HotkeyRecorder
                        value={binding.accelerator || null}
                        onChange={accelerator => {
                            const clash = bindings.some(
                                (b, i) => i !== index && b.accelerator === accelerator
                            );
                            if (clash) {
                                showToast(
                                    accelerator + " is already used by another sound",
                                    Toasts.Type.FAILURE
                                );
                                return;
                            }

                            const next = [...bindings];
                            next[index] = { ...binding, accelerator };
                            update(next);
                        }}
                    />
                    <Button
                        size={Button.Sizes.SMALL}
                        color={Button.Colors.RED}
                        onClick={() => update(bindings.filter((_, i) => i !== index))}
                    >
                        Remove
                    </Button>
                </div>
            ))}
        </div>
    );
}

const settings = definePluginSettings({
    bindings: {
        type: OptionType.STRING,
        description: "Serialised sound hotkey bindings",
        default: "",
        hidden: true
    },
    bindingsUI: {
        type: OptionType.COMPONENT,
        description: "Sound hotkeys",
        component: BindingsSettings
    }
});

// --- Context menu ----------------------------------------------------------

/**
 * Adds the sound with no accelerator; the user records one in plugin settings.
 */
function addBinding(sound: SoundboardSound): void {
    const bindings = readBindings();

    if (bindings.some(b => b.soundId === sound.soundId)) {
        showToast(sound.name + " already has a hotkey entry", Toasts.Type.MESSAGE);
        return;
    }

    writeBindings([
        ...bindings,
        {
            soundId: sound.soundId,
            // Default sounds carry no guild; only guild sounds need source_guild_id.
            guildId: sound.guildId ?? null,
            name: sound.name,
            accelerator: ""
        }
    ]);
    showToast("Added " + sound.name + " - set a key in plugin settings", Toasts.Type.SUCCESS);
}

/**
 * Pull the sound id out of whatever shape the context menu hands us, then look
 * the sound up in the store. Discord has renamed these props before, so several
 * spellings are accepted; the store is the source of truth for the rest.
 */
function findSound(args: unknown[]): SoundboardSound | null {
    for (const arg of args) {
        if (typeof arg !== "object" || arg === null) continue;

        const candidate = arg as Record<string, unknown>;
        const nested = candidate.sound as Record<string, unknown> | undefined;
        const id = candidate.soundId ?? candidate.sound_id ?? nested?.soundId;

        if (typeof id !== "string") continue;

        const sound = SoundboardStore.getSoundById(id);
        if (sound) return sound;
    }

    return null;
}

export default definePlugin({
    name: "SoundboardHotkeys",
    description:
        "Assign global hotkeys to Discord soundboard sounds - they fire even while " +
        "Discord is minimised or you are in a fullscreen game.",
    authors: [{ name: "griff", id: 0n }],
    settings,

    contextMenus: {
        // navId confirmed against the live client - see docs/TESTING.md step 0.
        "sound-button-context"(children, ...args) {
            const sound = findSound(args);
            if (!sound) return;

            children.push(
                <Menu.MenuItem
                    id="soundboard-hotkeys-assign"
                    label="Assign hotkey"
                    action={() => addBinding(sound)}
                />
            );
        }
    },

    async start() {
        await syncHotkeys();

        pollTimer = window.setInterval(() => {
            void pollPresses().catch(err => logger.error("Poll failed", err));
        }, POLL_INTERVAL_MS);
    },

    async stop() {
        if (pollTimer !== null) {
            clearInterval(pollTimer);
            pollTimer = null;
        }
        await Native.unregisterAll();
    }
});
