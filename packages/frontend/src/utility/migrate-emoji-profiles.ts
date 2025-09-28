/*
 * SPDX-FileCopyrightText: syuilo and misskey-project , Type4ny-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { prefer } from '@/preferences.js';
import { store } from '@/store.js';
import { genId } from '@/utility/id.js';
import { deepEqual } from '@/utility/deep-equal.js';

const LEGACY_PALETTE_IDS = new Set(['reactions', 'pinnedEmojis']);
const DEFAULT_EMOJIS = ['👍', '❤️', '😆', '🤔', '😮', '🎉', '💢', '😥', '😇', '🍮'];
const PROFILE_SUFFIXES = ['', '1', '2', '3', '4', '5'];

let migrationPromise: Promise<void> | null = null;

function normalizeEmojiList(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	const result: string[] = [];
	for (const emoji of value) {
		if (typeof emoji !== 'string') continue;
		if (emoji === '') continue;
		if (result.includes(emoji)) continue;
		result.push(emoji);
	}
	return result;
}

function toValidName(value: unknown): string {
	return typeof value === 'string' ? value : '';
}

export async function migrateEmojiProfilesToPalettesIfNeeded(): Promise<void> {
	if (!prefer.s.emojiPalettes.some(palette => LEGACY_PALETTE_IDS.has(palette.id))) return;
	migrationPromise ??= (async () => {
		await store.ready;

		const storeState = store.s as Record<string, unknown>;
		const basePalettes = prefer.s.emojiPalettes.filter(palette => !LEGACY_PALETTE_IDS.has(palette.id));
		const palettes = [...basePalettes];

		const addPalette = (name: string, emojis: string[]): string | null => {
			if (emojis.length === 0) return null;
			const existing = palettes.find(palette => deepEqual(palette.emojis, emojis));
			if (existing) return existing.id;
			const trimmedName = name.trim();
			const palette = {
				id: genId(),
				name: trimmedName,
				emojis,
			};
			palettes.push(palette);
			return palette.id;
		};

		const mainPaletteIds: Array<string | null> = [];
		const reactionPaletteIds: Array<string | null> = [];

		for (let i = 0; i < PROFILE_SUFFIXES.length; i++) {
			const suffix = PROFILE_SUFFIXES[i];
			const nameKey = i === 0 ? 'pickerProfileName' : `pickerProfileName${suffix}`;
			const pinnedKey = i === 0 ? 'pinnedEmojis' : `pinnedEmojis${suffix}`;
			const reactionsKey = i === 0 ? 'reactions' : `reactions${suffix}`;

			const profileName = toValidName(storeState[nameKey]);
			const pinnedEmojis = normalizeEmojiList(storeState[pinnedKey]);
			const reactionEmojis = normalizeEmojiList(storeState[reactionsKey]);

			const pinnedPaletteId = addPalette(profileName, pinnedEmojis);
			mainPaletteIds.push(pinnedPaletteId);

			if (reactionEmojis.length === 0) {
				reactionPaletteIds.push(pinnedPaletteId);
				continue;
			}

			if (pinnedPaletteId != null) {
				const pinnedPalette = palettes.find(palette => palette.id === pinnedPaletteId);
				if (pinnedPalette && deepEqual(pinnedPalette.emojis, reactionEmojis)) {
					reactionPaletteIds.push(pinnedPaletteId);
					continue;
				}
			}

			const reactionName = profileName === '' ? '' : `${profileName} (reaction)`;
			reactionPaletteIds.push(addPalette(reactionName, reactionEmojis));
		}

		if (palettes.length === 0) {
			palettes.push({
				id: genId(),
				name: '',
				emojis: [...DEFAULT_EMOJIS],
			});
		}

		const defaultIndexRaw = storeState.pickerProfileDefault;
		const defaultIndex = Number.isFinite(defaultIndexRaw) ? Number(defaultIndexRaw) : parseInt(String(defaultIndexRaw ?? '1'), 10);
		const clampedIndex = Number.isFinite(defaultIndex) ? Math.min(Math.max(defaultIndex, 1), PROFILE_SUFFIXES.length) : 1;

		const selectedMainId = mainPaletteIds[clampedIndex - 1] ?? null;
		const selectedReactionId = reactionPaletteIds[clampedIndex - 1] ?? selectedMainId ?? null;

		const fallbackPaletteId = palettes[0]?.id ?? null;

		prefer.commit('emojiPalettes', palettes);
		prefer.commit('emojiPaletteForMain', selectedMainId ?? fallbackPaletteId);
		prefer.commit('emojiPaletteForReaction', selectedReactionId ?? fallbackPaletteId);
	})()
		.finally(() => {
			migrationPromise = null;
		});

	return migrationPromise;
}
