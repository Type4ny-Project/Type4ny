<!--
SPDX-FileCopyrightText: syuilo and misskey-project , Type4ny-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div>
	<XWidgets :edit="editMode" :widgets="widgets" @addWidget="addWidget" @removeWidget="removeWidget" @updateWidget="updateWidget" @updateWidgets="updateWidgets" @exit="editMode = false"/>

	<button v-if="editMode" class="_textButton" style="font-size: 0.9em;" :class="{[$style.gamingDark]: gamingType === 'dark',[$style.gamingLight]: gamingType === 'light' }" @click="editMode = false"><i class="ti ti-check"></i> {{ i18n.ts.editWidgetsExit }}</button>
	<button v-else class="_textButton" data-cy-widget-edit :class="[$style.edit, {[$style.gamingDark]: gamingType === 'dark',[$style.gamingLight]: gamingType === 'light' }]" style="font-size: 0.9em;" @click="editMode = true"><i class="ti ti-pencil"></i> {{ i18n.ts.editWidgets }}</button>
</div>
</template>

<script lang="ts">
import { computed, ref, watch } from 'vue';
const editMode = ref(false);
</script>
<script lang="ts" setup>
import XWidgets from '@/components/MkWidgets.vue';
import { i18n } from '@/i18n.js';
import { prefer } from '@/preferences.js';
import { useGamingMode } from '@/composables/use-gaming-mode.js';

const { gamingType } = useGamingMode();
const props = withDefaults(defineProps<{
	// null = 全てのウィジェットを表示
	// left = place: leftだけを表示
	// right = rightとnullを表示
	place?: 'left' | null | 'right';
}>(), {
	place: null,
});

const widgets = computed(() => {
	if (props.place === null) return prefer.r.widgets.value;
	if (props.place === 'left') return prefer.r.widgets.value.filter(w => w.place === 'left');
	return prefer.r.widgets.value.filter(w => w.place !== 'left');
});

function addWidget(widget) {
	prefer.commit('widgets', [{
		...widget,
		place: props.place,
	}, ...prefer.s.widgets]);
}

function removeWidget(widget) {
	prefer.commit('widgets', prefer.s.widgets.filter(w => w.id !== widget.id));
}

function updateWidget({ id, data }) {
	prefer.commit('widgets', prefer.s.widgets.map(w => w.id === id ? {
		...w,
		data,
		place: props.place,
	} : w));
}

function updateWidgets(thisWidgets) {
	if (props.place === null) {
		prefer.commit('widgets', thisWidgets);
		return;
	}
	if (props.place === 'left') {
		prefer.commit('widgets', [
			...thisWidgets.map(w => ({ ...w, place: 'left' })),
			...prefer.s.widgets.filter(w => w.place !== 'left' && !thisWidgets.some(t => w.id === t.id)),
		]);
		return;
	}
	prefer.commit('widgets', [
		...prefer.s.widgets.filter(w => w.place === 'left' && !thisWidgets.some(t => w.id === t.id)),
		...thisWidgets.map(w => ({ ...w, place: 'right' })),
	]);
}
</script>

<style lang="scss" module>
.edit {
	width: 100%;
  &.gamingDark{
    animation: var(--gaming-animation-dark);
    background: var(--gaming-text-dark);
    background-size: 1800% 1800% !important;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    will-change: background-position;
    transform: translateZ(0);
  }
  &.gamingLight{
    animation: var(--gaming-animation-light);
    background: var(--gaming-text-light);
    background-size: 1800% 1800% !important;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    will-change: background-position;
    transform: translateZ(0);
  }
}
.gamingDark{
  animation: var(--gaming-animation-dark);
  background: var(--gaming-text-dark);
  background-size: 1800% 1800% !important;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  will-change: background-position;
  transform: translateZ(0);
}
.gamingLight{
  animation: var(--gaming-animation-light);
  background: var(--gaming-text-light);
  background-size: 1800% 1800% !important;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  will-change: background-position;
  transform: translateZ(0);
}
</style>
