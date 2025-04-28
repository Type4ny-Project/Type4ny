<!--
SPDX-FileCopyrightText: syuilo and misskey-project , Type4ny-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkPullToRefresh ref="prComponent" :refresher="() => reloadTimeline()">
	<MkPagination v-if="paginationQuery" ref="pagingComponent" :pagination="paginationQuery" @queue="emit('queue', $event)" @status="prComponent?.setDisabled($event)">
		<template #empty>
			<div class="_fullinfo">
				<img :src="infoImageUrl" draggable="false"/>
				<div>{{ i18n.ts.noNotes }}</div>
			</div>
		</template>

		<template #default="{ items: notes }">
			<component
				:is="prefer.s.animation ? TransitionGroup : 'div'"
				:class="[$style.root, { [$style.noGap]: noGap, '_gaps': !noGap, [$style.reverse]: paginationQuery.reversed }]"
				:enterActiveClass="$style.transition_x_enterActive"
				:leaveActiveClass="$style.transition_x_leaveActive"
				:enterFromClass="$style.transition_x_enterFrom"
				:leaveToClass="$style.transition_x_leaveTo"
				:moveClass=" $style.transition_x_move"
				tag="div"
			>
				<template v-for="(note, i) in notes" :key="note.id">
					<div v-if="note._shouldInsertAd_" :class="[$style.noteWithAd, { '_gaps': !noGap }]" :data-scroll-anchor="note.id">
						<MkNote :class="$style.note" :note="note" :withHardMute="true"/>
						<div :class="$style.ad">
							<MkAd :preferForms="['horizontal', 'horizontal-big']"/>
						</div>
					</div>
					<MkNote v-else :class="$style.note" :note="note" :withHardMute="true" :data-scroll-anchor="note.id"/>
				</template>
			</component>
		</template>
	</MkPagination>
</MkPullToRefresh>
</template>

<script lang="ts" setup>
import { computed, watch, onUnmounted, provide, useTemplateRef, TransitionGroup } from 'vue';
import * as Misskey from 'misskey-js';
import type { BasicTimelineType } from '@/timelines.js';
import type { Paging } from '@/components/MkPagination.vue';
import MkPullToRefresh from '@/components/MkPullToRefresh.vue';
import { useStream } from '@/stream.js';
import * as sound from '@/utility/sound.js';
import { $i } from '@/i.js';
import { instance } from '@/instance.js';
import { prefer } from '@/preferences.js';
import MkNote from '@/components/MkNote.vue';
import MkPagination from '@/components/MkPagination.vue';
import { i18n } from '@/i18n.js';
import { infoImageUrl } from '@/instance.js';

const props = withDefaults(defineProps<{
	src: BasicTimelineType | 'mentions' | 'directs' | 'list' | 'antenna' | 'channel' | 'role' | 'media';
	list?: string;
	antenna?: string;
	channel?: string;
	role?: string;
	sound?: boolean;
	withRenotes?: boolean;
	withReplies?: boolean;
	withSensitive?: boolean;
	onlyFiles?: boolean;
	withCw?: boolean;
}>(), {
	withRenotes: true,
	withReplies: false,
	withSensitive: true,
	onlyFiles: false,
	withCw: false,
});

const emit = defineEmits<{
	(ev: 'note'): void;
	(ev: 'queue', count: number): void;
}>();

provide('inTimeline', true);
provide('tl_withSensitive', computed(() => props.withSensitive));
provide('inChannel', computed(() => props.src === 'channel'));

type TimelineQueryType = {
	antennaId?: string,
	withRenotes?: boolean,
	withReplies?: boolean,
	withFiles?: boolean,
	visibility?: string,
	listId?: string,
	channelId?: string,
	roleId?: string
};

const prComponent = useTemplateRef('prComponent');
const pagingComponent = useTemplateRef('pagingComponent');

let tlNotesCount = 0;

function prepend(note) {
	if (pagingComponent.value == null) return;

	tlNotesCount++;

	if (instance.notesPerOneAd > 0 && tlNotesCount % instance.notesPerOneAd === 0) {
		note._shouldInsertAd_ = true;
	}

	pagingComponent.value.prepend(note);

	emit('note');

	if (props.sound) {
		sound.playMisskeySfx($i && (note.userId === $i.id) ? 'noteMy' : 'note');
	}
}

let connection: Misskey.ChannelConnection | null = null;
let connection2: Misskey.ChannelConnection | null = null;
let paginationQuery: Paging | null = null;
const noGap = !prefer.s.showGapBetweenNotesInTimeline;

const stream = useStream();

function connectChannel() {
	if (props.src === 'antenna' && props.antenna) {
		connection = stream.useChannel('antenna', { antennaId: props.antenna });
	} else if (props.src === 'home') {
		connection = stream.useChannel('homeTimeline', {
			withRenotes: props.withRenotes,
			withFiles: props.onlyFiles ? true : undefined,
		});
		connection2 = stream.useChannel('main');
	} else if (props.src === 'local') {
		connection = stream.useChannel('localTimeline', {
			withRenotes: props.withRenotes,
			withReplies: props.withReplies,
			withFiles: props.onlyFiles ? true : undefined,
		});
	} else if (props.src === 'media') {
		connection = stream.useChannel('hybridTimeline', {
			withFiles: true,
			withRenotes: props.withRenotes,
			withReplies: props.withReplies,
		});
	} else if (props.src === 'social' || props.src === 'global') {
		const channel = props.src === 'social' ? 'hybridTimeline' : 'globalTimeline';
		connection = stream.useChannel(channel, {
			withRenotes: props.withRenotes,
			withFiles: props.onlyFiles ? true : undefined,
		});
	} else if (props.src === 'mentions') {
		connection = stream.useChannel('main');
		connection.on('mention', prepend);
	} else if (props.src === 'directs') {
		const onNote = note => {
			if (note.visibility === 'specified') prepend(note);
		};
		connection = stream.useChannel('main');
		connection.on('mention', onNote);
	} else if (props.src === 'list' && props.list) {
		connection = stream.useChannel('userList', {
			withRenotes: props.withRenotes,
			withFiles: props.onlyFiles ? true : undefined,
			listId: props.list,
		});
	} else if (props.src === 'channel' && props.channel) {
		connection = stream.useChannel('channel', { channelId: props.channel });
	} else if (props.src === 'role' && props.role) {
		connection = stream.useChannel('roleTimeline', { roleId: props.role });
	}

	if (props.src !== 'directs' && props.src !== 'mentions') {
		connection?.on('note', prepend);
	}
}

function disconnectChannel() {
	if (connection) connection.dispose();
	if (connection2) connection2.dispose();
}

function updatePaginationQuery() {
	const endpoints = {
		antenna: 'antennas/notes',
		home: 'notes/timeline',
		local: 'notes/local-timeline',
		social: 'notes/hybrid-timeline',
		global: 'notes/global-timeline',
		media: 'notes/hybrid-timeline',
		mentions: 'notes/mentions',
		directs: 'notes/mentions',
		list: 'notes/user-list-timeline',
		channel: 'channels/timeline',
		role: 'roles/notes',
	};

	const queries = {
		antenna: { antennaId: props.antenna },
		home: { withRenotes: props.withRenotes, withFiles: props.onlyFiles ? true : undefined },
		local: { withRenotes: props.withRenotes, withReplies: props.withReplies, withFiles: props.onlyFiles ? true : undefined },
		social: { withRenotes: props.withRenotes, withReplies: props.withReplies, withFiles: props.onlyFiles ? true : undefined },
		global: { withRenotes: props.withRenotes, withFiles: props.onlyFiles ? true : undefined },
		media: { withFiles: true, withRenotes: props.withRenotes, withReplies: false },
		mentions: null,
		directs: { visibility: 'specified' },
		list: { withRenotes: props.withRenotes, withFiles: props.onlyFiles ? true : undefined, listId: props.list },
		channel: { channelId: props.channel },
		role: { roleId: props.role },
	};
	if (props.src.startsWith('remoteLocalTimeline')) {
		paginationQuery = {
			endpoint: 'notes/any-local-timeline',
			limit: 10,
			params: {
				host: props.list,
			},
		};
	} else {
		const endpoint = endpoints[props.src];
		const query = queries[props.src];
		paginationQuery = endpoint && query ? { endpoint, limit: 10, params: query } : null;
	}
}

function refreshEndpointAndChannel() {
	if (!prefer.s.disableStreamingTimeline) {
		disconnectChannel();
		connectChannel();
	}
	updatePaginationQuery();
}

watch(() => [props.list, props.antenna, props.channel, props.role, props.withRenotes], refreshEndpointAndChannel);

// withSensitiveはクライアントで完結する処理のため、単にリロードするだけでOK
watch(() => props.withSensitive, reloadTimeline);

// 初回表示用
refreshEndpointAndChannel();

onUnmounted(() => {
	disconnectChannel();
});

function reloadTimeline() {
	return new Promise<void>((res) => {
		if (pagingComponent.value == null) return;

		tlNotesCount = 0;

		pagingComponent.value.reload().then(() => res());
	});
}

defineExpose({
	reloadTimeline,
});
</script>

<style lang="scss" module>
.transition_x_move,
.transition_x_enterActive,
.transition_x_leaveActive {
	transition: opacity 0.3s cubic-bezier(0,.5,.5,1), transform 0.3s cubic-bezier(0,.5,.5,1) !important;
}
.transition_x_enterFrom,
.transition_x_leaveTo {
	opacity: 0;
	transform: translateY(-50%);
}
.transition_x_leaveActive {
	position: absolute;
}

.reverse {
	display: flex;
	flex-direction: column-reverse;
}

.root {
	container-type: inline-size;

	&.noGap {
		background: var(--MI_THEME-panel);

		.note {
			border-bottom: solid 0.5px var(--MI_THEME-divider);
		}

		.ad {
			padding: 8px;
			background-size: auto auto;
			background-image: repeating-linear-gradient(45deg, transparent, transparent 8px, var(--MI_THEME-bg) 8px, var(--MI_THEME-bg) 14px);
			border-bottom: solid 0.5px var(--MI_THEME-divider);
		}
	}

	&:not(.noGap) {
		background: var(--MI_THEME-bg);

		.note {
			background: var(--MI_THEME-panel);
			border-radius: var(--MI-radius);
		}
	}
}

.ad:empty {
	display: none;
}
</style>
