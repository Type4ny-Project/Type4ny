<!--
SPDX-FileCopyrightText: syuilo and misskey-project , Type4ny-projectSPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkPostForm data-cy-mkw-postForm class="_panel mkw-post-form" :fixed="true" :autofocus="false"/>
</template>

<script lang="ts" setup>
import { defineAsyncComponent } from 'vue';
import { useWidgetPropsManager } from './widget.js';
import type { WidgetComponentEmits, WidgetComponentExpose, WidgetComponentProps } from './widget.js';
import type { FormWithDefault, GetFormResultType } from '@/utility/form.js';
const MkPostForm = defineAsyncComponent(() => import('@/components/MkPostForm.vue'));
const name = 'postForm';

const widgetPropsDef = {
} satisfies FormWithDefault;

type WidgetProps = GetFormResultType<typeof widgetPropsDef>;

const props = defineProps<WidgetComponentProps<WidgetProps>>();
const emit = defineEmits<WidgetComponentEmits<WidgetProps>>();

const { widgetProps, configure } = useWidgetPropsManager(name,
	widgetPropsDef,
	props,
	emit,
);

defineExpose<WidgetComponentExpose>({
	name,
	configure,
	id: props.widget ? props.widget.id : null,
});
</script>
