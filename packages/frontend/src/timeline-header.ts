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

const lists = $i ? await userListsCache.fetch() : [];
const userChannels = $i ? await userChannelsCache.fetch() : [];
const userChannelFollowings = $i ? await userChannelFollowingsCache.fetch() : [];
const userFavoriteLists = $i ? await userFavoriteListsCache.fetch() : [];
const antenna = $i ? await antennasCache.fetch() : [];

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
	...lists.reduce((acc, l) => {
		acc['list:' + l.id] = {
			title: i18n.ts.lists + ':' + l.name,
			icon: 'ti ti-star',
			iconOnly: false,
		};
		return acc;
	}, {}),
	...userChannels.reduce((acc, l) => {
		acc['channel:' + l.id] = {
			title: i18n.ts.channel + ':' + l.name,
			icon: 'ti ti-star',
			iconOnly: false,
		};
		return acc;
	}, {}),
	...userChannelFollowings.reduce((acc, l) => {
		acc['channel:' + l.id] = {
			title: i18n.ts.channel + ':' + l.name,
			icon: 'ti ti-star',
			iconOnly: false,
		};
		return acc;
	}, {}),
	...userFavoriteLists.reduce((acc, l) => {
		acc['channel:' + l.id] = {
			title: i18n.ts.channel + ':' + l.name,
			icon: 'ti ti-star',
			iconOnly: false,
		};
		return acc;
	}, {}),
	...antenna.reduce((acc, l) => {
		acc['antenna:' + l.id] = {
			title: i18n.ts.antennas + ':' + l.name,
			icon: 'ti ti-star',
			iconOnly: false,
		};
		return acc;
	}, {}),
});

