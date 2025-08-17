<!--
SPDX-FileCopyrightText: Type4ny-project
SPDX-License-Identifier: AGPL-3.0-only
-->
<template>
<MkPagination ref="emojisRequestPaginationComponent" :paginator="paginatorRequest">
	<template #empty><span>{{ i18n.ts.noCustomEmojis }}</span></template>
	<template #default="{items}">
		<template v-for="emoji in items" :key="emoji.id">
			<div :class="$style.emoji" class="_panel">
				<div :class="$style.img">
					<div :class="$style.imgLight"><img :src="emoji.url" :alt="emoji.name"/></div>
					<div :class="$style.imgDark"><img :src="emoji.url" :alt="emoji.name"/></div>
				</div>
				<div :class="$style.info">
					<div :class="$style.name">{{ i18n.ts.name }}: {{ emoji.name }}</div>
					<div :class="$style.category">{{ i18n.ts.category }}:{{ emoji.category }}</div>
					<div :class="$style.aliases">{{ i18n.ts.tags }}:{{ emoji.aliases.join(' ') }}</div>
					<div :class="$style.license">{{ i18n.ts.license }}:{{ emoji.license }}</div>
				</div>
				<div :class="$style.editbutton">
					<MkButton primary :class="$style.edit" @click="editRequest(emoji)">
						{{ i18n.ts.edit }}
					</MkButton>
					<MkButton :class="$style.request" @click="unrequested(emoji)">
						{{ i18n.ts.approval }}
					</MkButton>
					<MkButton danger :class="$style.delete" @click="deleteRequest(emoji)">
						{{ i18n.ts.delete }}
					</MkButton>
				</div>
			</div>
		</template>
	</template>
</MkPagination>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, ref, shallowRef, markRaw } from 'vue';
import MkPagination from '@/components/MkPagination.vue';
import * as os from '@/os';
import { i18n } from '@/i18n';
import MkButton from '@/components/MkButton.vue';
import { misskeyApi } from '@/utility/misskey-api.js';
import { Paginator } from '@/utility/paginator.js';

const emojisRequestPaginationComponent = shallowRef<InstanceType<typeof MkPagination>>();

const query = ref(null);

const paginatorRequest = markRaw(new Paginator('admin/emoji/list-request', {
	limit: 30,
	computedParams: computed(() => ({
		query: (query.value && query.value !== '') ? query.value : null,
	})),
}));

function editRequest(emoji) {
	os.popup(defineAsyncComponent(() => import('@/components/MkEmojiEditDialog.vue')), {
		emoji: emoji,
		isRequest: true,
	}, {
		done: result => {
			if (result.updated) {
				emojisRequestPaginationComponent.value.paginator.updateItem(result.updated.id, (oldEmoji: any) => ({
					...oldEmoji,
					...result.updated,
				}));
				emojisRequestPaginationComponent.value.paginator.reload();
			} else if (result.deleted) {
				emojisRequestPaginationComponent.value.paginator.removeItem((item) => item.id === emoji.id);
				emojisRequestPaginationComponent.value.paginator.reload();
			}
		},
	}, 'closed');
}

async function unrequested(emoji) {
	const { canceled } = await os.confirm({
		type: 'warning',
		text: i18n.tsx.requestApprovalAreYouSure( { x: emoji.name }),
	});
	if (canceled) return;

	await misskeyApi('admin/emoji/update-request', {
		id: emoji.id,
		fileId: emoji.fileId,
		name: emoji.name,
		category: emoji.category,
		aliases: emoji.aliases,
		license: emoji.license,
		isSensitive: emoji.isSensitive,
		localOnly: emoji.localOnly,
		isRequest: false,
	});

	emojisRequestPaginationComponent.value.paginator.removeItem((item) => item.id === emoji.id);
	emojisRequestPaginationComponent.value.paginator.reload();
}

async function deleteRequest(emoji) {
	const { canceled } = await os.confirm({
		type: 'warning',
		text: i18n.tsx.removeAreYouSure( { x: emoji.name }),
	});
	if (canceled) return;

	misskeyApi('admin/emoji/delete', {
		id: emoji.id,
	}).then(() => {
		emojisRequestPaginationComponent.value.removeItem((item) => item.id === emoji.id);
		emojisRequestPaginationComponent.value.reload();
	});
}
</script>

<style lang="scss" module>
.emoji {
  align-items: center;
  padding: 11px;
  text-align: left;
  border: solid 1px var(--MI_THEME-panel);
  margin: 10px;
}
.img {
  display: grid;
  grid-row: 1;
  grid-column: 1/ span 2;
  grid-template-columns: 50% 50%;
  place-content: center;
  place-items: center;
}
.imgLight {
  display: grid;
  grid-column: 1;
  background-color: #fff;
  margin-bottom: 12px;
  img {
    max-height: 64px;
    max-width: 100%;
  }
}
.imgDark {
  display: grid;
  grid-column: 2;
  background-color: #000;
  margin-bottom: 12px;
  img {
    max-height: 64px;
    max-width: 100%;
  }
}
.info {
  display: grid;
  grid-row: 2;
  grid-template-rows: 30px 30px 30px;
}
.name {
  grid-row: 1;
  text-overflow: ellipsis;
  overflow: hidden;
}

.category {
  grid-row: 2;
  text-overflow: ellipsis;
  overflow: hidden;
}

.aliases {
  grid-row: 3;
  text-overflow: ellipsis;
  overflow: hidden;
}

.license {
  grid-row: 4;
  text-overflow: ellipsis;
  overflow: hidden;
}
.editbutton {
  display: grid;
  grid-template-rows: 42px;
  margin-top: 6px;
}
.edit {
  grid-row: 1;
  width: 100%;
  margin: 6px 0;
}

.request {
  grid-row: 2;
  width: 100%;
  margin: 6px 0;
}

.delete {
  grid-row: 3;
  width: 100%;
  margin: 6px 0;
}
</style>
