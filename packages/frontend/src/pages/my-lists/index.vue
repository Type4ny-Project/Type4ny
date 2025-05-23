<!--
SPDX-FileCopyrightText: syuilo and misskey-project , Type4ny-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader :actions="headerActions" :tabs="headerTabs">
	<div class="_spacer" style="--MI_SPACER-w: 700px;">
		<MkFoldableSection style="margin-bottom: 32px;">
			<template #header>{{ i18n.ts.favoriteLists }}</template>

			<div class="_gaps">
				<div v-if="feautureList.length === 0" class="empty">
					<div class="_fullinfo">
						<img :src="infoImageUrl" class="_ghost"/>
						<div>{{ i18n.ts.nothing }}</div>
					</div>
				</div>

				<div v-if="feautureList.length > 0" class="_gaps">
					<MkA v-for="list in feautureList" :key="list.id" class="_panel" :class="$style.list" :to="`/list/${ list.id }`">
						<div style="margin-bottom: 4px;">{{ list.name }} <span :class="$style.nUsers">({{ i18n.tsx.nUsers({ n: `${list.userIds.length}` }) }})</span></div>
						<MkAvatars :userIds="list.userIds" :limit="10"/>
					</MkA>
				</div>
			</div>
		</MkFoldableSection>
		<MkFoldableSection style="margin-bottom: 32px;">
			<template #header>{{ i18n.ts.localListList }}</template>
			<div class="_gaps">
				<div v-if="localList.length === 0" class="empty">
					<div class="_fullinfo">
						<img :src="infoImageUrl" class="_ghost"/>
						<div>{{ i18n.ts.nothing }}</div>
					</div>
				</div>

				<div v-if="localList.length > 0" class="_gaps">
					<MkA v-for="list in localList" :key="list.id" class="_panel" :class="$style.list" :to="`/list/${ list.id }`">
						<div style="margin-bottom: 4px;">{{ list.name }} <span :class="$style.nUsers">({{ i18n.tsx.nUsers({ n: `${list.userIds.length}` }) }})</span></div>
						<MkAvatars :userIds="list.userIds" :limit="10"/>
					</MkA>
				</div>
			</div>
		</MkFoldableSection>
		<MkFoldableSection>
			<template #header>{{ i18n.ts.myLists }}</template>
			<div class="_gaps">
				<MkTip k="userLists">
				{{ i18n.ts._userLists.tip }}
			</MkTip>

			<MkResult v-if="items.length === 0" type="empty"/>

				<div v-if="items.length > 0" class="_gaps">
					<MkA v-for="list in items" :key="list.id" class="_panel" :class="$style.list" :to="`/my/lists/${ list.id }`">
						<div style="margin-bottom: 4px;">{{ list.name }} <span :class="$style.nUsers">({{ i18n.tsx.nUsers({ n: `${list.userIds.length}/${$i.policies['userEachUserListsLimit']}` }) }})</span></div>
						<MkAvatars :userIds="list.userIds" :limit="10"/>
					</MkA>
				</div>
			</div>
		</MkFoldableSection>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { onActivated, computed } from 'vue';
import MkAvatars from '@/components/MkAvatars.vue';
import * as os from '@/os.js';
import { i18n } from '@/i18n.js';
import { definePage } from '@/page.js';
import { userFavoriteListsCache, userListsCache } from '@/cache.js';
import { ensureSignin } from '@/i.js';
import MkFoldableSection from '@/components/MkFoldableSection.vue';
import { misskeyApi } from '@/scripts/misskey-api.js';

const $i = ensureSignin();

const items = computed(() => userListsCache.value.value ?? []);
const localList = await misskeyApi('users/lists/list', { publicAll: true });
const feautureList = computed(() => userFavoriteListsCache.value.value ?? []);

function fetch() {
	userListsCache.fetch();
	userFavoriteListsCache.delete();
	userFavoriteListsCache.fetch();
}

fetch();

async function create() {
	const { canceled, result: name } = await os.inputText({
		title: i18n.ts.enterListName,
	});
	if (canceled) return;
	await os.apiWithDialog('users/lists/create', { name: name });
	userListsCache.delete();
	fetch();
}

const headerActions = computed(() => [{
	asFullButton: true,
	icon: 'ti ti-refresh',
	text: i18n.ts.reload,
	handler: () => {
		userListsCache.delete();
		fetch();
	},
}, {
	asFullButton: true,
	icon: 'ti ti-plus',
	text: i18n.ts.createList,
	handler: create,
}]);

const headerTabs = computed(() => []);

definePage(() => ({
	title: i18n.ts._exportOrImport.userLists,
	icon: 'ti ti-list',
}));

onActivated(() => {
	fetch();
});
</script>

<style lang="scss" module>
.list {
	display: block;
	padding: 16px;
	border: solid 1px var(--MI_THEME-divider);
	border-radius: var(--MI-radius);
	margin-bottom: 8px;

	&:hover {
		border: solid 1px var(--MI_THEME-accent);
		text-decoration: none;
	}
}

.nUsers {
	font-size: .9em;
	opacity: .7;
}
</style>
