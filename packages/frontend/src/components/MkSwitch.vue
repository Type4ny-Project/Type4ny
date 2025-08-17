<!--
SPDX-FileCopyrightText: syuilo and misskey-project , Type4ny-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="[$style.root, { [$style.disabled]: disabled }]">
	<input
		ref="input"
		type="checkbox"
		:disabled="disabled"
		:class="$style.input"
		@click="toggle"
	>
	<XButton :class="$style.toggle" :checked="checked" :disabled="disabled" @toggle="toggle"/>
	<span v-if="!noBody" :class="[$style.body,{[$style.gamingDark]: gamingType === 'dark',[$style.gamingLight]: gamingType === 'light'}]">
		<!-- TODO: 無名slotの方は廃止 -->
		<span :class="$style.label">
			<span @click="toggle">
				<slot name="label"></slot><slot></slot>
			</span>
			<span v-if="helpText" v-tooltip:dialog="helpText" class="_button _help" :class="$style.help"><i class="ti ti-help-circle"></i></span>
		</span>
		<p :class="$style.caption"><slot name="caption"></slot></p>
	</span>
</div>
</template>

<script lang="ts" setup>
import { toRefs } from 'vue';
import type { Ref, ref, computed, watch } from 'vue';
import XButton from '@/components/MkSwitch.button.vue';
import { useGamingMode } from '@/composables/use-gaming-mode.js';

const { gamingType } = useGamingMode();

const props = defineProps<{
	modelValue: boolean | Ref<boolean>;
	disabled?: boolean;
	helpText?: string;
	noBody?: boolean;
}>();

const emit = defineEmits<{
	(ev: 'update:modelValue', v: boolean): void;
	(ev: 'change', v: boolean): void;
}>();

const checked = toRefs(props).modelValue;
const toggle = () => {
	if (props.disabled) return;
	emit('update:modelValue', !checked.value);
	emit('change', !checked.value);
};
</script>

<style lang="scss" module>
.root {
	position: relative;
	display: flex;
	transition: all 0.2s ease;
	user-select: none;

	&:hover {
		> .button {
			border-color: var(--MI_THEME-inputBorderHover) !important;
		}
	}

	&.disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

  &.gamingDarkDisabled{
    opacity: 0.6;
    cursor: not-allowed;
    animation: var(--gaming-animation-dark);
    background: linear-gradient(270deg, #a84f4f, #a88c4f, #9aa24b, #6da85c, #53a8a6, #7597b5, #8679b5, #b579b5, #b56d96);
    background-size: 1800% 1800% !important;
    will-change: background-position;
    transform: translateZ(0);
  }
  &.gamingLightDisabled{
    opacity: 0.6;
    cursor: not-allowed;
    animation: var(--gaming-animation-light);
    background: var(--gaming-bg-light);
    background-size: 1800% 1800%;
    will-change: background-position;
    transform: translateZ(0);
  }
	//&.checked {
	//}
}

.input {
	position: absolute;
	width: 0;
	height: 0;
	opacity: 0;
	margin: 0;

	&:focus-visible ~ .toggle {
		outline: 2px solid var(--MI_THEME-focus);
		outline-offset: 2px;
	}
}

.body {
	margin-left: 12px;
	margin-top: 2px;
	display: block;
	transition: inherit;
	color: var(--MI_THEME-fg);

	&.gamingDark {
		animation: var(--gaming-animation-dark);
		background: var(--gaming-text-dark);
		background-size: 1800% 1800%;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		will-change: background-position;
		transform: translateZ(0);
	}

	&.gamingLight {
		animation: var(--gaming-animation-light);
		background: var(--gaming-text-light);
		background-size: 1800% 1800%;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		will-change: background-position;
		transform: translateZ(0);
	}
}

.label {
	display: block;
	line-height: 20px;
	cursor: pointer;
	transition: inherit;
}

.caption {
	margin: 8px 0 0 0;
	color: color(from var(--MI_THEME-fg) srgb r g b / 0.75);
	font-size: 0.85em;

	&:empty {
		display: none;
	}
}

.help {
	margin-left: 0.5em;
	font-size: 85%;
	vertical-align: top;
}

</style>
