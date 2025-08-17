<!--
SPDX-FileCopyrightText: syuilo and misskey-project , Type4ny-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<span
	v-tooltip="checked ? i18n.ts.itsOn : i18n.ts.itsOff"
	:class="{
		[$style.button]: true,
		[$style.gamingDark]: gamingType === 'dark' && checked,
		[$style.gamingLight]: gamingType === 'light' && checked,
		[$style.buttonChecked]: checked,
		[$style.buttonDisabled]: props.disabled,

	}"
	data-cy-switch-toggle
	@click.prevent.stop="toggle"
>
	<div
		:class="{ [$style.knob]: true, [$style.knobChecked]: checked,	[$style.gamingDark]: gamingType === 'dark' && checked,[$style.gamingLight]: gamingType === 'light' && checked}"
	></div>
</span>
</template>

<script lang="ts" setup>
import { toRefs } from 'vue';
import type { Ref, computed } from 'vue';
import { i18n } from '@/i18n.js';
import { useGamingMode } from '@/composables/use-gaming-mode.js';

const { gamingType } = useGamingMode();

const props = withDefaults(defineProps<{
  checked: boolean | Ref<boolean>;
  disabled?: boolean | Ref<boolean>;
}>(), {
	disabled: false,
});

const emit = defineEmits<{
  (ev: 'toggle'): void;
}>();

const checked = toRefs(props).checked;
const toggle = () => {
	emit('toggle');
};
</script>

<style lang="scss" module>
.button {
  --height: 21px;position: relative;
  display: inline-flex;
  flex-shrink: 0;
  margin: 0;
  box-sizing: border-box;
  width: calc(var(--height) * 1.6);
  height: calc(var(--height) + 2px); // 枠線
  outline: none;
  background: var(--MI_THEME-switchOffBg);
  background-clip: content-box;
  border: solid 1px var(--MI_THEME-switchOffBg);
  border-radius: 999px;
  cursor: pointer;
  transition: inherit;
  user-select: none;

  &.gamingLight {
    border-image: var(--gaming-border-light) 1;
    border: solid 1px;
    animation: var(--gaming-animation-light);
    will-change: border-image;
    transform: translateZ(0);
  }

  &.gamingDark {
    border-image: var(--gaming-border-dark) 1;
    border: solid 1px;
    animation: var(--gaming-animation-dark);
    will-change: border-image;
    transform: translateZ(0);
  }
}

.buttonChecked {
  background-color: var(--MI_THEME-switchOnBg);
  border-color: var(--MI_THEME-switchOnBg);
}

.gamingLight {
  animation: var(--gaming-animation-light);
  background: var(--gaming-border-light);
  background-size: 1800% 1800% !important;
  will-change: background-position;
  transform: translateZ(0);
}

.gamingDark {
  animation: var(--gaming-animation-dark);
  background: var(--gaming-bg-light);
  background-size: 1800% 1800% !important;
  will-change: background-position;
  transform: translateZ(0);
}

.buttonDisabled {
  cursor: not-allowed;
}

.knob {
  position: absolute;
  box-sizing: border-box;top: 3px;
  width: calc(var(--height) - 6px);
  height: calc(var(--height) - 6px);
  border-radius: 999px;
  transition: all 0.2s ease;

  &:not(.knobChecked) {
    left: 3px;
    background: var(--MI_THEME-switchOffFg);

  }
}

.knobChecked {
  left: calc(calc(100% - var(--height)) + 3px);
  background: var(--MI_THEME-switchOnFg);

  &.gamingDark {
    background: white !important;
  }

  &.gamingLight {
    background: white !important;
  }
}

</style>
