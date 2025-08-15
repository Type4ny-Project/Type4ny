/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { reactive } from 'vue';
import { i18n } from '@/i18n.js';
import {
	antennasCache,
	userChannelFollowingsCache,
	userChannelsCache,
	userFavoriteListsCache,
	userListsCache,
} from '@/cache.js';
import { isLocalTimelineAvailable, isGlobalTimelineAvailable } from '@/utility/get-timeline-available.js';
import { $i } from '@/i.js';

export type TimelineHeaderItem =
	'home' |
	'local' |
	'social' |
	'global' |
	'lists' |
	'antennas' |
	'channels' |
	`list:${string}` |
	`channel:${string}` |
	`antenna:${string}` |
	'media' |
	`customTimeline:${string}`;

type TimelineHeaderItemsDef = {
	title: string;
	icon: string;
	iconOnly?: boolean; // わからん
};

export const timelineHeaderItemDef = reactive<Partial<Record<TimelineHeaderItem, TimelineHeaderItemsDef>>>({
	home: {
		title: i18n.ts._timelines.home,
		icon: 'ti ti-home',
		iconOnly: false,
	},
	...(isLocalTimelineAvailable() ? {
		local: {
			title: i18n.ts._timelines.local,
			icon: 'ti ti-planet',
			iconOnly: false,
		},
		social: {
			title: i18n.ts._timelines.social,
			icon: 'ti ti-universe',
			iconOnly: false,
		},
		media: {
			title: i18n.ts._timelines.media,
			icon: 'ti ti-photo',
			iconOnly: false,
		} } : {}),
	...(isGlobalTimelineAvailable() ? { global: {
		title: i18n.ts._timelines.global,
		icon: 'ti ti-whirl',
		iconOnly: false,
	} } : {}),
	lists: {
		icon: 'ti ti-list',
		title: i18n.ts.lists,
		iconOnly: false,
	},
	antennas: {
		icon: 'ti ti-antenna',
		title: i18n.ts.antennas,
		iconOnly: false,
	},
	channels: {
		icon: 'ti ti-device-tv',
		title: i18n.ts.channel,
		iconOnly: false,
	},
});

export async function updateTimelineHeaderItems() {
	try {
		const [lists, userChannels, userChannelFollowings, userFavoriteLists, antenna] = await Promise.all([
			userListsCache.fetch(),
			userChannelsCache.fetch(),
			userChannelFollowingsCache.fetch(),
			userFavoriteListsCache.fetch(),
			antennasCache.fetch(),
		]);

		// Clear existing dynamic items
		for (const key in timelineHeaderItemDef) {
			if (key.startsWith('list:') || key.startsWith('channel:') || key.startsWith('antenna:')) {
				delete timelineHeaderItemDef[key];
			}
		}

		// Add lists
		lists.forEach(l => {
			timelineHeaderItemDef[`list:${l.id}`] = {
				title: `${i18n.ts.lists}:${l.name}`,
				icon: 'ti ti-star',
				iconOnly: false,
			};
		});

		// Add user channels
		userChannels.forEach(l => {
			timelineHeaderItemDef[`channel:${l.id}`] = {
				title: `${i18n.ts.channel}:${l.name}`,
				icon: 'ti ti-device-tv',
				iconOnly: false,
			};
		});

		// Add channel followings
		userChannelFollowings.forEach(l => {
			// Only add if not already added by userChannels
			if (!timelineHeaderItemDef[`channel:${l.id}`]) {
				timelineHeaderItemDef[`channel:${l.id}`] = {
					title: `${i18n.ts.channel}:${l.name}`,
					icon: 'ti ti-device-tv',
					iconOnly: false,
				};
			}
		});

		// Add favorite lists (these should probably be lists, not channels)
		userFavoriteLists.forEach(l => {
			// This seems like a bug - favorite lists should use 'list:' prefix
			if (!timelineHeaderItemDef[`list:${l.id}`]) {
				timelineHeaderItemDef[`list:${l.id}`] = {
					title: `${i18n.ts.lists}:${l.name}`,
					icon: 'ti ti-star',
					iconOnly: false,
				};
			}
		});

		// Add antennas
		antenna.forEach(l => {
			timelineHeaderItemDef[`antenna:${l.id}`] = {
				title: `${i18n.ts.antennas}:${l.name}`,
				icon: 'ti ti-antenna',
				iconOnly: false,
			};
		});
	} catch (error) {
		console.error('Failed to update timeline header items:', error);
	}
}

// Initialize on first load if user is logged in
if ($i) {
	updateTimelineHeaderItems();
}

