<!--
1
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkWindow ref="uiWindow" :initialWidth="400" :initialHeight="500" :canResize="true" style="overflow-x: clip;" @closed="emit('closed')">
	<template #header>
		<i class="ti ti-exclamation-circle" style="margin-right: 0.5em;"></i>
		<I18n :src="i18n.ts.reportAbuseOf" tag="span">
			<template #name>
				<b><MkAcct :user="user"/></b>
			</template>
		</I18n>
	</template>
	<div class="_spacer" style="--MI_SPACER-min: 20px; --MI_SPACER-max: 28px;">
		<div class="_gaps_m" :class="$style.root">
			<div class="">
				<MkTextarea v-model="comment">
					<template #label>{{ i18n.ts.details }}</template>
					<template #caption>{{ i18n.ts.fillAbuseReportDescription }}</template>
				</MkTextarea>
			</div>
			<div class="">
				<MkButton primary full :disabled="comment.length === 0" @click="send">{{ i18n.ts.send }}</MkButton>
			</div>
		</div>
	</div>
</MkWindow>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';
import * as Misskey from 'misskey-js';
import MkWindow from '@/components/MkWindow.vue';
import MkTextarea from '@/components/MkTextarea.vue';
import MkButton from '@/components/MkButton.vue';
import * as os from '@/os.js';
import { i18n } from '@/i18n.js';
import MkPagination from '@/components/MkPagination.vue';
import MkNoteSimple from '@/components/MkNoteSimple.vue';
import MkSwitch from '@/components/MkSwitch.vue';

const props = defineProps<{
	user: Misskey.entities.UserLite;
	initialComment?: string;
  initialNoteId?: Misskey.entities.Note['id'];
}>();

const Pagination = {
	endpoint: 'users/notes' as const,
	limit: 10,
	params: {
		userId: props.user.id,
	},
};
const emit = defineEmits<{
	(ev: 'closed'): void;
}>();

const abuseNotesId = ref(props.initialNoteId ? [props.initialNoteId] : []);
const page = ref(0);
const uiWindow = useTemplateRef('uiWindow');
const comment = ref(props.initialComment ?? '');

function pushAbuseReportNote(ev, id) {
	if (ev) {
		abuseNotesId.value.push(id);
	} else {
		abuseNotesId.value = abuseNotesId.value.filter(noteId => noteId !== id);
	}
}

function send() {
	os.apiWithDialog('users/report-abuse', {
		userId: props.user.id,
		comment: comment.value,
		noteIds: abuseNotesId.value,
	}, undefined).then(res => {
		os.alert({
			type: 'success',
			text: i18n.ts.abuseReported,
		});
		uiWindow.value?.close();
		emit('closed');
	});
}
</script>

<style lang="scss" module>
.root {
	--root-margin: 16px;
}
.transition_x_enterActive,
.transition_x_leaveActive {
	transition: opacity 0.3s cubic-bezier(0,0,.35,1), transform 0.3s cubic-bezier(0,0,.35,1);
}
.transition_x_enterFrom {
	opacity: 0;
	transform: translateX(50px);
}
.transition_x_leaveTo {
	opacity: 0;
	transform: translateX(-50px);
}
.note{
  display: flex;
  margin: var(--MI-margin) 0;
  align-items: center;

}
</style>
