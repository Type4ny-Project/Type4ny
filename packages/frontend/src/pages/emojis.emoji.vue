<!--
SPDX-FileCopyrightText: syuilo and misskey-project , Type4ny-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<button v-if="request" class="_button emoji-request" :class="$style.root" @click="menu">
	<img :src="emoji.url" :class="$style.img" loading="lazy"/>
	<div class="body">
		<div class="name _monospace">{{ emoji.name + ' (request)' }}</div>
		<div class="info">{{ emoji.aliases.join(' ') }}</div>
	</div>
</button>
<button v-else class="_button" :class="$style.root" @click="menu">
	<img :src="emoji.url" :class="$style.img" loading="lazy"/>
	<div :class="$style.body">
		<div class="name _monospace">{{ emoji.name }}</div>
		<div class="info">{{ emoji.aliases.join(' ') }}</div>
	</div>
</button>
</template>

<script lang="ts" setup>
import * as Misskey from 'misskey-js';
import { defineAsyncComponent } from 'vue';
import type { MenuItem } from '@/types/menu.js';
import * as os from '@/os.js';
import { misskeyApiGet } from '@/scripts/misskey-api.js';
import { copyToClipboard } from '@/scripts/copy-to-clipboard.js';
import { i18n } from '@/i18n.js';
import MkCustomEmojiDetailedDialog from '@/components/MkCustomEmojiDetailedDialog.vue';
import { $i } from '@/account.js';

const props = defineProps<{
  emoji: Misskey.entities.EmojiSimple;
  request?: boolean;
}>();

function menu(ev) {
	const menuItems: MenuItem[] = [];
	menuItems.push({
		type: 'label',
		text: ':' + props.emoji.name + ':',
	}, {
		text: i18n.ts.copy,
		icon: 'ti ti-copy',
		action: () => {
			copyToClipboard(`:${props.emoji.name}:`);
			os.success();
		},
	}, {
		text: i18n.ts.info,
		icon: 'ti ti-info-circle',
		action: async () => {
			const { dispose } = os.popup(MkCustomEmojiDetailedDialog, {
				emoji: await misskeyApiGet('emoji', {
					name: props.emoji.name,
				}),
			}, {
				closed: () => dispose(),
			});
		},
	});

	if ($i?.isModerator ?? $i?.isAdmin) {
		menuItems.push({
			text: i18n.ts.edit,
			icon: 'ti ti-pencil',
			action: () => {
				edit(props.emoji);
			},
		});
	}

	os.popupMenu(menuItems, ev.currentTarget ?? ev.target);
}

const edit = async (emoji) => {
	const { dispose } = os.popup(defineAsyncComponent(() => import('@/pages/emoji-edit-dialog.vue')), {
		emoji: emoji,
	}, {
		closed: () => dispose(),
	});
};
</script>

<style lang="scss" module>
.root {
  display: flex;
  align-items: center;
  padding: 12px;
  text-align: left;
  background: var(--MI_THEME-panel);
  border-radius: 8px;

  &:hover {
    border-color: var(--MI_THEME-accent);
  }
}

.img {
  width: 42px;
  height: 42px;
  object-fit: contain;
}

.body {
  padding: 0 0 0 8px;
  white-space: nowrap;
  overflow: hidden;
}

.name {
  text-overflow: ellipsis;
  overflow: hidden;
}

.info {
  opacity: 0.5;
  font-size: 0.9em;
  text-overflow: ellipsis;
  overflow: hidden;
}

.emoji-request {
  --c: rgb(255 196 0 / 15%);;
  background-image: linear-gradient(45deg,var(--c) 16.67%,transparent 16.67%,transparent 50%,var(--c) 50%,var(--c) 66.67%,transparent 66.67%,transparent 100%);
  background-size: 16px 16px;
}
</style>
