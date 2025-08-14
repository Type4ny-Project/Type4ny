<!--
SPDX-FileCopyrightText: syuilo and misskey-project , Type4ny-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkStickyContainer>
	<template #header><MkPageHeader v-model:tab="tab" :hide="true" :actions="headerActions" :tabs="headerTabs"/></template>
	<div v-if="tab === 'emojis'" class="_spacer" style="--MI_SPACER-w: 1000px; --MI_SPACER-min: 20px;">
		<MkButton v-if="$i && ($i.isModerator || $i.policies.canManageCustomEmojis)" primary link to="/custom-emojis-manager">{{ i18n.ts.manageCustomEmojis }}</MkButton>
		<MkButton v-if="$i && (!$i.isModerator || $i.policies.canRequestCustomEmojis)" primary @click="edit">{{ i18n.ts.requestCustomEmojis }}</MkButton>

		<div class="query" style="margin-top: 10px;">
			<MkInput v-model="q" class="" :placeholder="i18n.ts.search" autocapitalize="off">
				<template #prefix><i class="ti ti-search"></i></template>
			</MkInput>

		<!-- たくさんあると邪魔
		<div class="tags">
			<span class="tag _button" v-for="tag in customEmojiTags" :class="{ active: selectedTags.has(tag) }" @click="toggleTag(tag)">{{ tag }}</span>
		</div>
		-->
		</div>

		<MkFoldableSection v-if="searchEmojis" :expanded="false">
			<template #header>{{ i18n.ts.searchResult }}</template>
			<div :class="$style.emojis">
				<XEmoji v-for="emoji in searchEmojis" :key="emoji.name" :emoji="emoji" :request="emoji.request"/>
			</div>
		</MkFoldableSection>

		<MkFoldableSection v-for="category in customEmojiCategories" v-once :key="category" :expanded="false">
			<template #header>{{ category || i18n.ts.other }}</template>
			<div :class="$style.emojis">
				<XEmoji v-for="emoji in customEmojis.filter(e => e.category === category)" :key="emoji.name" :emoji="emoji"/>
			</div>
		</MkFoldableSection>
	</div>
	<div v-if="tab === 'request'" class="_spacer" style="--MI_SPACER-w: 1000px; --MI_SPACER-min: 20px;">
		<div :class="$style.emojis">
			<XEmoji v-for="emoji in requestEmojis.emojis" :key="emoji.name" :emoji="emoji" :request="true"/>
		</div>
	</div>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { watch, defineAsyncComponent, ref, computed } from 'vue';
import * as Misskey from 'misskey-js';
import XEmoji from './emojis.emoji.vue';
import MkButton from '@/components/MkButton.vue';
import MkInput from '@/components/MkInput.vue';
import MkFoldableSection from '@/components/MkFoldableSection.vue';
import { customEmojis, customEmojiCategories } from '@/custom-emojis.js';
import { i18n } from '@/i18n.js';
import { $i } from '@/i.js';
import { definePage } from '@/utility/page-metadata';
import { misskeyApiGet } from '@/utility/misskey-api.js';
import * as os from '@/os.js';
let tab = ref('emojis');
const headerActions = computed(() => []);

const headerTabs = computed(() => [{
	key: 'emojis',
	title: i18n.ts.list,
}, {
	key: 'request',
	title: i18n.ts.requestingEmojis,
}]);

let q = ref('');
let searchEmojis = ref<Misskey.entities.CustomEmoji[]>(null);
let selectedTags = ref(new Set());
const requestEmojis = await misskeyApiGet('emoji-requests');

function search() {
	if ((q.value === '' || q.value == null) && selectedTags.value.size === 0) {
		searchEmojis.value = null;
		return;
	}

	if (selectedTags.value.size === 0) {
		const queryarry = q.value.match(/\:([a-z0-9_]*)\:/g);

		if (queryarry) {
			searchEmojis.value = customEmojis.value.filter(emoji =>
				queryarry.includes(`:${emoji.name}:`),
			);
		} else {
			searchEmojis.value = customEmojis.value.filter(emoji => emoji.name.includes(q.value) || emoji.aliases.includes(q));
		}
	} else {
		searchEmojis.value = customEmojis.value.filter(emoji => (emoji.name.includes(q.value) || emoji.aliases.includes(q)) && [...selectedTags].every(t => emoji.aliases.includes(t)));
	}
}

const edit = () => {
	os.popup(defineAsyncComponent(() => import('@/components/MkEmojiEditDialog.vue')), {
		isRequest: true,
	}, {
		done: result => {
			window.location.reload();
		},
	}, 'closed');
};

watch((q), () => {
	search();
});

watch((selectedTags), () => {
	search();
}, { deep: true });

</script>

<style lang="scss" module>
.emojis {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
	grid-gap: 12px;
}
</style>
