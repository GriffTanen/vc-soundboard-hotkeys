/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { Card } from "@components/Card";
import { Divider } from "@components/Divider";
import { Flex } from "@components/Flex";
import { DeleteIcon } from "@components/Icons";
import { Paragraph } from "@components/Paragraph";
import { TooltipContainer } from "@components/TooltipContainer";
import { Logger } from "@utils/Logger";
import definePlugin, { OptionType, PluginNative } from "@utils/types";
import { SoundboardSound } from "@vencord/discord-types";
import { findByCodeLazy } from "@webpack";
import {
    Button, MediaEngineStore, Menu, React, RestAPI, SearchableSelect,
    SelectedChannelStore, showToast, SoundboardStore, Toasts
} from "@webpack/common";

import { HotkeyRecorder, toAccelerator } from "./HotkeyRecorder";
import { t } from "./i18n";
import { SoundBinding } from "./types";

const logger = new Logger("SoundboardHotkeys");

/**
 * Discord's own soundboard button does two separate things: it POSTs to the
 * REST endpoint (which broadcasts the emoji and plays the sound for everyone
 * else) and it dispatches this action, which is what actually produces audio.
 * Without it the request succeeds, the emoji shows up, and nobody hears
 * anything - the bug this plugin hit.
 */
const playSoundLocally = findByCodeLazy('type:"GUILD_SOUNDBOARD_SOUND_PLAY_LOCALLY"') as
    (channelId: string, sound: SoundboardSound, trigger: number) => void;

/** Matches the client's own trigger value for a soundboard button press. */
const PLAY_TRIGGER = 1;

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
            t().unavailable + " " + failed.join(", "),
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
        showToast(t().joinVoice, Toasts.Type.FAILURE);
        return;
    }

    if (MediaEngineStore.isSelfMute() || MediaEngineStore.isSelfDeaf()) {
        showToast(t().mutedOrDeafened, Toasts.Type.FAILURE);
        return;
    }

    // Discord's own client always sends the emoji fields. Without them the
    // request returns 204 but no sound is ever played, so they are required in
    // practice even though the docs list only sound_id.
    const sound = SoundboardStore.getSoundById(binding.soundId);
    const emojiId = sound?.emojiId ?? binding.emojiId ?? null;
    const emojiName = sound?.emojiName ?? binding.emojiName ?? null;

    try {
        // Order matters only in that both must happen; the dispatch is what
        // makes the sound audible, the POST is what tells the server.
        playSoundLocally(channelId, sound ?? {
            soundId: binding.soundId,
            name: binding.name,
            emojiId,
            emojiName,
            guildId: binding.guildId ?? "",
            volume: 1,
            available: true
        } as SoundboardSound, PLAY_TRIGGER);

        await RestAPI.post({
            url: "/channels/" + channelId + "/send-soundboard-sound",
            body: {
                sound_id: binding.soundId,
                emoji_id: emojiId,
                emoji_name: emojiName,
                ...(binding.guildId ? { source_guild_id: binding.guildId } : {})
            }
        });
    } catch (err) {
        // Discord enforces a ~5s per-user cooldown; 429 is the common case here.
        logger.error("Failed to send soundboard sound", err);
        showToast(t().couldNotPlay + " " + binding.name, Toasts.Type.FAILURE);
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

/** The sound's emoji, or a neutral placeholder so rows keep a stable width. */
function SoundEmoji({ binding }: { binding: SoundBinding; }) {
    const style: React.CSSProperties = {
        width: "22px",
        flexShrink: 0,
        textAlign: "center",
        fontSize: "18px",
        lineHeight: "22px"
    };

    if (binding.emojiId) {
        return (
            <img
                src={"https://cdn.discordapp.com/emojis/" + binding.emojiId + ".png?size=32"}
                alt=""
                style={{ ...style, height: "22px", objectFit: "contain" }}
            />
        );
    }

    return <span style={style}>{binding.emojiName ?? "♪"}</span>;
}

/** Sounds that can still be bound, flattened across every guild. */
function useUnboundSounds(bindings: SoundBinding[]) {
    const bound = new Set(bindings.map(b => b.soundId));
    const sounds: SoundboardSound[] = [];

    for (const guildSounds of SoundboardStore.getSounds().values()) {
        for (const sound of guildSounds) {
            if (!bound.has(sound.soundId)) sounds.push(sound);
        }
    }

    return sounds.sort((a, b) => a.name.localeCompare(b.name));
}

function BindingsSettings() {
    const [bindings, setBindings] = React.useState<SoundBinding[]>(readBindings);
    // Sound id whose key should be recorded right after it was added.
    const [recordFor, setRecordFor] = React.useState<string | null>(null);

    function update(next: SoundBinding[]): void {
        setBindings(next);
        writeBindings(next);
        void syncHotkeys();
    }

    function setAccelerator(index: number, accelerator: string): void {
        const clash = bindings.some((b, i) => i !== index && b.accelerator === accelerator);
        if (clash) {
            showToast(accelerator + " " + t().conflictWithSound, Toasts.Type.FAILURE);
            return;
        }

        const next = [...bindings];
        next[index] = { ...bindings[index], accelerator };
        update(next);
    }

    function addSound(soundId: string): void {
        const sound = SoundboardStore.getSoundById(soundId);
        if (!sound) return;

        update([...bindings, {
            soundId: sound.soundId,
            guildId: sound.guildId ?? null,
            name: sound.name,
            emojiId: sound.emojiId ?? null,
            emojiName: sound.emojiName ?? null,
            accelerator: ""
        }]);

        // Jump straight into recording so adding a sound is a single gesture.
        setRecordFor(sound.soundId);
    }

    const unbound = useUnboundSounds(bindings);

    return (
        <div>
            {bindings.length === 0 && (
                <Card style={{ marginBottom: "12px" }}>
                    <Paragraph>{t().noBindings}</Paragraph>
                </Card>
            )}

            {bindings.map((binding, index) => (
                <Card key={binding.soundId} style={{ marginBottom: "8px", padding: "10px 12px" }}>
                    <Flex alignItems="center" gap="10px">
                        <SoundEmoji binding={binding} />

                        <Paragraph
                            style={{
                                flexGrow: 1,
                                margin: 0,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                            }}
                        >
                            {binding.name}
                        </Paragraph>

                        <HotkeyRecorder
                            value={binding.accelerator || null}
                            autoFocus={recordFor === binding.soundId}
                            onChange={accelerator => {
                                setRecordFor(null);
                                setAccelerator(index, accelerator);
                            }}
                        />

                        <TooltipContainer text={t().removeTooltip}>
                            <Button
                                size={Button.Sizes.MIN}
                                color={Button.Colors.TRANSPARENT}
                                look={Button.Looks.LINK}
                                onClick={() => update(bindings.filter((_, i) => i !== index))}
                                aria-label={t().removeTooltip}
                            >
                                <DeleteIcon />
                            </Button>
                        </TooltipContainer>
                    </Flex>
                </Card>
            ))}

            <Divider style={{ margin: "16px 0 12px" }} />

            {unbound.length === 0
                ? <Paragraph>{t().noSoundsAvailable}</Paragraph>
                : (
                    <SearchableSelect
                        placeholder={t().addSoundPlaceholder}
                        options={unbound.map(sound => ({
                            value: sound.soundId,
                            label: (sound.emojiName ? sound.emojiName + "  " : "") + sound.name
                        }))}
                        value={undefined}
                        clearOnSelect={true}
                        closeOnSelect={true}
                        onChange={(soundId: string) => addSound(soundId)}
                    />
                )}
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
 * Capture the next key press anywhere in the client and resolve to an
 * accelerator. Escape (or losing the window) cancels.
 */
function captureNextKey(): Promise<string | null> {
    return new Promise(resolve => {
        function cleanup(): void {
            document.removeEventListener("keydown", onKeyDown, true);
            window.removeEventListener("blur", onCancel);
        }

        function onCancel(): void {
            cleanup();
            resolve(null);
        }

        function onKeyDown(event: KeyboardEvent): void {
            event.preventDefault();
            event.stopPropagation();

            if (event.code === "Escape") {
                onCancel();
                return;
            }

            const accelerator = toAccelerator(event);
            if (accelerator === null) return;

            cleanup();
            resolve(accelerator);
        }

        document.addEventListener("keydown", onKeyDown, true);
        window.addEventListener("blur", onCancel);
    });
}

/**
 * Bind a hotkey to a sound directly from the soundboard: the user presses a
 * combination and it is registered immediately, with no trip to settings.
 */
async function bindFromContextMenu(sound: SoundboardSound): Promise<void> {
    showToast(t().pressAKey, Toasts.Type.MESSAGE);

    const accelerator = await captureNextKey();
    if (accelerator === null) return;

    const bindings = readBindings();

    const clash = bindings.find(
        b => b.accelerator === accelerator && b.soundId !== sound.soundId
    );
    if (clash) {
        showToast(accelerator + " " + t().conflictWithSound, Toasts.Type.FAILURE);
        return;
    }

    const existing = bindings.findIndex(b => b.soundId === sound.soundId);
    const binding: SoundBinding = {
        soundId: sound.soundId,
        // Default sounds carry no guild; only guild sounds need source_guild_id.
        guildId: sound.guildId ?? null,
        name: sound.name,
        emojiId: sound.emojiId ?? null,
        emojiName: sound.emojiName ?? null,
        accelerator
    };

    const next = [...bindings];
    if (existing === -1) next.push(binding);
    else next[existing] = binding;

    writeBindings(next);

    // Register straight away - this is what was missing before, and why a
    // binding made from the context menu never actually fired.
    await syncHotkeys();

    showToast(sound.name + " " + t().boundTo + " " + accelerator, Toasts.Type.SUCCESS);
}

/** Drop a sound's hotkey and unregister it. */
async function removeBinding(soundId: string): Promise<void> {
    writeBindings(readBindings().filter(b => b.soundId !== soundId));
    await syncHotkeys();
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
    // Vencord renders this header itself and does not localise it, so both
    // languages are spelled out.
    description:
        "Global hotkeys for Discord's soundboard - they fire even while Discord is " +
        "minimised or you are in a fullscreen game. / " +
        "Глобальные хоткеи для звуковой панели Discord - работают даже когда Discord " +
        "свёрнут или вы в полноэкранной игре.",
    authors: [{ name: "GriffTanen", id: 377062587382366210n }],
    settings,

    contextMenus: {
        // navId confirmed against the live client - see docs/TESTING.md step 0.
        "sound-button-context"(children, ...args) {
            const sound = findSound(args);
            if (!sound) return;

            const existing = readBindings().find(b => b.soundId === sound.soundId);

            children.push(
                <Menu.MenuItem
                    id="soundboard-hotkeys-assign"
                    label={existing?.accelerator
                        ? t().changeHotkey + " (" + existing.accelerator + ")"
                        : t().assignHotkey}
                    action={() => void bindFromContextMenu(sound)}
                />
            );

            if (existing) {
                children.push(
                    <Menu.MenuItem
                        id="soundboard-hotkeys-remove"
                        label={t().removeHotkey}
                        color="danger"
                        action={() => void removeBinding(sound.soundId)}
                    />
                );
            }
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
