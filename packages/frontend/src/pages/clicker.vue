<!--
SPDX-FileCopyrightText: syuilo and misskey-project , Type4ny-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader>
	<MkSpacer :contentMax="800">
		<MkClickerGame/>
	</MkSpacer>
</PageWithHeader>
</template>

<script lang="ts" setup>
import MkClickerGame from '@/components/MkClickerGame.vue';
import { definePage } from '@/page.js';

definePage(() => ({
	title: '●👈',
	icon: 'ti ti-circle',
}));
</script>

<style lang="scss" module>

</style>
