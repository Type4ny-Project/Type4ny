<!--
SPDX-FileCopyrightText: syuilo and misskey-project , Type4ny-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs">
	<div class="_spacer" style="--MI_SPACER-w: 900px;">
		<div class="ogwlenmc">
			<div v-if="tab === 'local'" class="local">
				<MkCustomEmojiEditLocal/>
			</div>
			<div v-if="tab === 'request'" class="request">
				<MkCustomEmojiEditRequest/>
			</div>
			<div v-else-if="tab === 'remote'" class="remote">
				<MkCustomEmojiEditRemote/>
			</div>
		</div>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { computed, ref, markRaw } from 'vue';
import PageWithHeader from '@/components/global/PageWithHeader.vue';
import MkCustomEmojiEditRequest from '@/components/MkCustomEmojiEditRequest.vue';
import MkCustomEmojiEditLocal from '@/components/MkCustomEmojiEditLocal.vue';
import MkCustomEmojiEditRemote from '@/components/MkCustomEmojiEditRemote.vue';
import { selectFile } from '@/utility/select-file.js';
import * as os from '@/os.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { i18n } from '@/i18n.js';
import { definePage } from '@/page.js';
import { Paginator } from '@/utility/paginator.js';

const tab = ref('local');
const query = ref<string | null>(null);
const selectedEmojis = ref<string[]>([]);

const paginator = markRaw(new Paginator('admin/emoji/list', {
	limit: 30,
	computedParams: computed(() => ({
		query: (query.value && query.value !== '') ? query.value : null,
	})),
}));

const emojisPaginationComponent = ref<any>(null);
const selectAll = () => {
	if (selectedEmojis.value.length > 0) {
		selectedEmojis.value = [];
	} else {
		selectedEmojis.value = emojisPaginationComponent.value.paginator.items.value.map(item => item.id);
	}
};

const toggleSelect = (emoji) => {
	if (selectedEmojis.value.includes(emoji.id)) {
		selectedEmojis.value = selectedEmojis.value.filter(emojiId => emojiId !== emoji.id);
	} else {
		selectedEmojis.value.push(emoji.id);
	}
};

const add = async (ev: MouseEvent) => {
	const { dispose } = await os.popupAsyncWithDialog(import('../components/MkEmojiEditDialog.vue').then(module => module.default), {
	}, {
		done: result => {
			if (result.created) {
				paginator.prepend(result.created);
			}
		},
		closed: () => dispose(),
	});
};

const menu = (ev: MouseEvent) => {
	os.popupMenu([{
		icon: 'ti ti-download',
		text: i18n.ts.export,
		action: async () => {
			misskeyApi('export-custom-emojis', {
			})
				.then(() => {
					os.alert({
						type: 'info',
						text: i18n.ts.exportRequested,
					});
				}).catch((err) => {
					os.alert({
						type: 'error',
						text: err.message,
					});
				});
		},
	}, {
		icon: 'ti ti-upload',
		text: i18n.ts.import,
		action: async () => {
			const file = await selectFile({
				anchorElement: ev.currentTarget ?? ev.target,
				multiple: false,
			});
			misskeyApi('admin/emoji/import-zip', {
				fileId: file.id,
			})
				.then(() => {
					os.alert({
						type: 'info',
						text: i18n.ts.importRequested,
					});
				}).catch((err) => {
					os.alert({
						type: 'error',
						text: err.message,
					});
				});
		},
	}], ev.currentTarget ?? ev.target);
};

const headerActions = computed(() => [{
	asFullButton: true,
	icon: 'ti ti-plus',
	text: i18n.ts.addEmoji,
	handler: add,
}, {
	icon: 'ti ti-dots',
	handler: menu,
}]);

const headerTabs = computed(() => [{
	key: 'request',
	title: i18n.ts.requestingEmojis,
}, {
	key: 'local',
	title: i18n.ts.local,
}, {
	key: 'remote',
	title: i18n.ts.remote,
}]);

definePage(() => ({
	title: i18n.ts.customEmojis,
	icon: 'ti ti-icons',
}));
</script>

<style lang="scss" scoped>
</style>
