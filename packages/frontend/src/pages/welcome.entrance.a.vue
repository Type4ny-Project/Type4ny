<!--
SPDX-FileCopyrightText: syuilo and misskey-project , Type4ny-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div v-if="meta" class="rsqzvsbo">
	<MkFeaturedPhotos class="bg"/>
	<div class="shape1"></div>
	<div class="shape2"></div>
	<XTimeline class="tl"/>
	<div class="logo-wrapper">
		<div class="powered-by">Powered by</div>
		<img :src="type4nySVG" class="type4ny" alt="Type4ny Logo"/>
	</div>
	<div class="emojis">
		<MkEmoji :normal="true" :noStyle="true" emoji="👍"/>
		<MkEmoji :normal="true" :noStyle="true" emoji="❤"/>
		<MkEmoji :normal="true" :noStyle="true" emoji="😆"/>
		<MkEmoji :normal="true" :noStyle="true" emoji="🎉"/>
		<MkEmoji :normal="true" :noStyle="true" emoji="🍮"/>
	</div>
	<div class="contents">
		<MkVisitorDashboard/>
	</div>
</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import * as Misskey from 'misskey-js';
import XTimeline from './welcome.timeline.vue';
import MarqueeText from '@/components/MkMarquee.vue';
import MkFeaturedPhotos from '@/components/MkFeaturedPhotos.vue';
import type4nySVG from '/client-assets/Type4ny-Logo.svg';
import { misskeyApiGet } from '@/scripts/misskey-api.js';
import MkVisitorDashboard from '@/components/MkVisitorDashboard.vue';
import { getProxiedImageUrl } from '@/scripts/media-proxy.js';
import { instance as meta } from '@/instance.js';

const instances = ref<Misskey.entities.FederationInstance[]>();

misskeyApiGet('federation/instances', {
	sort: '+pubSub',
	limit: 20,
}).then(_instances => {
	instances.value = _instances;
});
</script>

<style lang="scss" scoped>
.rsqzvsbo {
	display:flex;
	justify-content: center;
	> .bg {
		position: fixed;
		top: 0;
		right: 0;
		width: 80vw; // 100%からshapeの幅を引いている
		height: 100vh;
	}
	> .tl {
		position: fixed;
		top: 0;
		bottom: 0;
		right: 64px;
		margin: auto;
		padding: 128px 0;
		width: 500px;
		height: calc(100% - 256px);
		overflow: hidden;
		-webkit-mask-image: linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 128px, rgba(0,0,0,1) calc(100% - 128px), rgba(0,0,0,0) 100%);
		mask-image: linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 128px, rgba(0,0,0,1) calc(100% - 128px), rgba(0,0,0,0) 100%);

		@media (max-width: 1200px) {
			display: none;
		}
	}

	> .shape1 {
		position: fixed;
		top: 0;
		right: 0;
		width: 100vw;
		height: 100vh;
		background: linear-gradient(270deg, var(--MI_THEME-buttonGradateA), var(--MI_THEME-buttonGradateB));
		background-size: 2000% 2000%;
		-webkit-animation: AnimationLight 11s ease infinite;
		-moz-animation: AnimationLight 11s ease infinite;
		animation: AnimationLight 11s ease infinite;
		clip-path: polygon(0% 0%, 45% 0%, 20% 100%, 0% 100%);
	}
	> .shape2 {
		position: fixed;
		top: 0;
		right: 0;

		width: 100vw;
		height: 100vh;
    background: linear-gradient(270deg, var(--MI_THEME-buttonGradateA), var(--MI_THEME-buttonGradateB));
		background-size: 2000% 2000%;
    -webkit-animation: AnimationLight 11s ease infinite;
    -moz-animation: AnimationLight 11s ease infinite;
    animation: AnimationLight 11s ease  infinite;
		clip-path: polygon(0% 0%, 25% 0%, 35% 100%, 0% 100%);
		opacity: 0.5;
	}

	> .logo-wrapper {
		position: fixed;
		top: 36px;
		left: 36px;
		flex: auto;
		color: #fff;
		user-select: none;
		pointer-events: none;

		> .powered-by {
			margin-bottom: 2px;
		}

		> .type4ny {
			width: 170px;
			@media (max-width: 450px) {
				width: 150px;
			}
		}
	}

	> .emojis {
		position: fixed;
		bottom: 32px;
		left: 35px;

		> * {
			margin-right: 8px;
		}

		@media (max-width: 1200px) {
			display: none;
		}
	}

	> .contents {
		position: relative;
		width: min(430px, calc(100% - 32px));
		padding: 128px 0 0 0;
		top: 0;
		bottom: 0;
		margin-right: 32px;
		@media (max-width: 1200px) {
			margin: auto;
		}
	}

	> .federation {
		position: fixed;
		bottom: 16px;
		left: 0;
		right: 0;
		margin: auto;
		background: var(--MI_THEME-acrylicPanel);
		-webkit-backdrop-filter: var(--MI-blur, blur(15px));
		backdrop-filter: var(--MI-blur, blur(15px));
		border-radius: 999px;
		overflow: clip;
		width: 800px;
		padding: 8px 0;

		@media (max-width: 900px) {
			display: none;
		}
	}
}
@-webkit-keyframes AnimationLight {
  0% {
    background-position: 0% 50%
  }
  50% {
    background-position: 100% 50%
  }
  100% {
    background-position: 0% 50%
  }
}
@-moz-keyframes AnimationLight {
  0% {
    background-position: 0% 50%
  }
  50% {
    background-position: 100% 50%
  }
  100% {
    background-position: 0% 50%
  }
}
@keyframes AnimationLight {
     0% {
       background-position: 0% 50%
     }
     50% {
       background-position: 100% 50%
     }
     100% {
       background-position: 0% 50%
     }
   }
</style>

<style lang="scss" module>
.federationInstance {
	display: inline-flex;
	align-items: center;
	vertical-align: bottom;
	padding: 6px 12px 6px 6px;
	margin: 0 10px 0 0;
	background: var(--MI_THEME-panel);
	border-radius: 999px;

	> :global(.icon) {
		display: inline-block;
		width: 20px;
		height: 20px;
		margin-right: 5px;
		border-radius: 999px;
	}
}
</style>
