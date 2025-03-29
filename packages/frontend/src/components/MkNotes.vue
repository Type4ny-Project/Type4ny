<!--
SPDX-FileCopyrightText: syuilo and misskey-project , Type4ny-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkPagination ref="pagingComponent" :pagination="pagination" :disableAutoLoad="disableAutoLoad">
	<template #empty>
		<div class="_fullinfo">
			<img :src="infoImageUrl" draggable="false"/>
			<div>{{ i18n.ts.noNotes }}</div>
		</div>
	</template>

	<template #default="{ items: notes }">
		<div :class="[$style.root, { [$style.noGap]: noGap, '_gaps': !noGap }]">
			<template v-for="(note, i) in notes" :key="note.id">
				<MkNote :class="$style.note" :note="note" :withHardMute="true"/>
				<div v-if="note._shouldInsertAd_" :class="$style.ad">
					<MkAd :prefer="['horizontal', 'horizontal-big']"/>
				</div>
			</template>
		</div>
	</template>
</MkPagination>
</template>

<script lang="ts" setup>
import { useTemplateRef, TransitionGroup } from 'vue';
import type { Paging } from '@/components/MkPagination.vue';
import MkNote from '@/components/MkNote.vue';
import MkPagination from '@/components/MkPagination.vue';
import { i18n } from '@/i18n.js';
import { infoImageUrl } from '@/instance.js';
import { prefer } from '@/preferences.js';
import MkDateSeparatedList from '@/components/MkDateSeparatedList.vue';
const dateTextCache = new Map<string, string>();

const props = defineProps<{
	pagination: Paging;
	noGap?: boolean;
	disableAutoLoad?: boolean;
    withCw?: boolean;
}>();
const pagingComponent = useTemplateRef('pagingComponent');

defineExpose({
	pagingComponent,
});
</script>

<style lang="scss" module>
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
		.note{
			&:not(:last-child) {
				border-bottom: solid 0.5px var(--MI_THEME-divider);
			}
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
.dateseparatedlist {
	container-type: inline-size;

	&:global {
		> .list-move {
			transition: transform 0.7s cubic-bezier(0.23, 1, 0.32, 1);
		}

		&.deny-move-transition > .list-move {
			transition: none !important;
		}

		> .list-enter-active {
			transition: transform 0.7s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.7s cubic-bezier(0.23, 1, 0.32, 1);
		}

		> *:empty {
			display: none;
		}
	}

	&:not(.date-separated-list-nogap) > *:not(:last-child) {
		margin-bottom: var(--MI-margin);
	}
}

.dateseparatedlistnogap {
	> * {
		margin: 0 !important;
		border: none;
		border-radius: 0;
		box-shadow: none;

		&:not(:last-child) {
			border-bottom: solid 0.5px var(--MI_THEME-divider);
		}
	}
}

.direction-up {
	&:global {
		> .list-enter-from,
		> .list-leave-to {
			opacity: 0;
			transform: translateY(64px);
		}
	}
}
.direction-down {
	&:global {
		> .list-enter-from,
		> .list-leave-to {
			opacity: 0;
			transform: translateY(-64px);
		}
	}
}

.reversed {
	display: flex;
	flex-direction: column-reverse;
}

.separator {
	border-bottom: solid 1px var(--MI_THEME-divider);
	text-align: center;
}

.date {
	display: inline-block;
	position: relative;
	margin: 0;
	padding: 0 16px;
	line-height: 32px;
	text-align: center;
	font-size: 12px;
	color: var(--dateLabelFg);
}

.date1 {
	margin-right: 8px;
}

.date1icon {
	margin-right: 8px;
}

.date2 {
	margin-left: 8px;
}

.date2icon {
	margin-left: 8px;
}

.before-leave {
	position: absolute !important;
}
</style>
