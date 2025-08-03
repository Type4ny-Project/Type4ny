<!--
SPDX-FileCopyrightText: syuilo and misskey-project , Type4ny-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader :tabs="headerTabs">
	<div class="_spacer" style="--MI_SPACER-w: 700px; --MI_SPACER-min: 16px; --MI_SPACER-max: 32px;">
		<SearchMarker path="/admin/branding" :label="i18n.ts.branding" :keywords="['branding']" icon="ti ti-paint">
			<div class="_gaps_m">
				<SearchMarker :keywords="['icon', 'image']">
				<MkInput v-model="iconUrl" type="url">
					<template #prefix><i class="ti ti-link"></i></template>
					<template #label><SearchLabel>{{ i18n.ts._serverSettings.iconUrl }}</SearchLabel></template>
				</MkInput><MkInput v-model="iconDark" type="url">
						<template #prefix><i class="ti ti-link"></i></template>
						<template #label>
							{{ i18n.ts._serverSettings.iconUrl }} (Dark)
						</template>
					</MkInput>
					<MkInput v-model="iconLight" type="url">
						<template #prefix><i class="ti ti-link"></i></template>
						<template #label>
							{{ i18n.ts._serverSettings.iconUrl }} (Light)
						</template>
					</MkInput>

					<MkFolder>
						<template #icon><i class="ti ti-image"></i></template>
						<template #label>{{ i18n.ts.backgroundImageUrls }}</template>
						<div class="_gaps">
							<MkButton @click="()=>backgroundImageUrls.push('')">
								{{ i18n.ts.add }}
							</MkButton>
							<div v-for="(url,i) in backgroundImageUrls">
								<MkInput v-model="backgroundImageUrls[0].url">
									<template #label>{{ i18n.ts.backgroundImageUrl }}</template>
								</MkInput>
								<MkButton danger @click="()=>backgroundImageUrls.splice(i,1)">
									<template #default>
										<i class="ti ti-trash"></i>
										<span>{{ i18n.ts.remove }}</span>
									</template>
								</MkButton>
							</div>
						</div>
					</MkFolder>

					<MkInput v-model="backgroundImageUrl" type="url">
						<template #prefix><i class="ti ti-link"></i></template>
						<template #label>
							{{ i18n.ts.backgroundImageUrl }} (deprecated)
						</template>
					</MkInput>
				</SearchMarker>

				<SearchMarker :keywords="['icon', 'image']">
					<MkInput v-model="app192IconUrl" type="url">
						<template #prefix><i class="ti ti-link"></i></template>
						<template #label><SearchLabel>{{ i18n.ts._serverSettings.iconUrl }} (App/192px)
						</SearchLabel></template>
						<template #caption>
							<div>{{ i18n.tsx._serverSettings.appIconDescription({ host: instance.name ?? host ,
									})
								}}</div>
							<div>({{ i18n.ts._serverSettings.appIconUsageExample }})</div>
							<div>{{ i18n.ts._serverSettings.appIconStyleRecommendation }}</div>
							<div><strong>{{ i18n.tsx._serverSettings.appIconResolutionMustBe({ resolution: "192x192px",
									}) }}</strong></div>
						</template>
					</MkInput>
				</SearchMarker>

				<SearchMarker :keywords="['icon', 'image']">
					<MkInput v-model="app512IconUrl" type="url">
						<template #prefix><i class="ti ti-link"></i></template>
						<template #label><SearchLabel>{{ i18n.ts._serverSettings.iconUrl }} (App/512px)
						</SearchLabel></template>
						<template #caption>
							<div>{{ i18n.tsx._serverSettings.appIconDescription({ host: instance.name ?? host ,
									})
								}}</div>
							<div>({{ i18n.ts._serverSettings.appIconUsageExample }})</div>
							<div>{{ i18n.ts._serverSettings.appIconStyleRecommendation }}</div>
							<div><strong>{{ i18n.tsx._serverSettings.appIconResolutionMustBe({ resolution: "512x512px",
									}) }}</strong></div>
						</template>
					</MkInput>
				</SearchMarker>

				<SearchMarker :keywords="['banner', 'image']">
				<MkInput v-model="bannerUrl" type="url">
					<template #prefix><i class="ti ti-link"></i></template>
					<template #label>{{ i18n.ts.bannerUrl }}</template>
				</MkInput>
				</SearchMarker>
					<SearchMarker :keywords="['banner', 'image']">
					<MkInput v-model="bannerDark" type="url">
						<template #prefix><i class="ti ti-link"></i></template>
						<template #label>{{ i18n.ts.bannerUrl }} (Dark)</template>
					</MkInput>
					</SearchMarker>
						<SearchMarker :keywords="['banner', 'image']">
				<MkInput v-model="bannerLight" type="url">
					<template #prefix><i class="ti ti-link"></i></template>
					<template #label>{{ i18n.ts.bannerUrl }} (Light)</template>
				</MkInput>
		</SearchMarker>

				<SearchMarker :keywords="['image']">
					<MkInput v-model="notFoundImageUrl" type="url">
						<template #prefix><i class="ti ti-link"></i></template>
						<template #label><SearchLabel>{{ i18n.ts.notFoundDescription }}</SearchLabel></template>
					</MkInput>
				</SearchMarker>

				<SearchMarker :keywords="['image']">
					<MkInput v-model="infoImageUrl" type="url">
						<template #prefix><i class="ti ti-link"></i></template>
						<template #label><SearchLabel>{{ i18n.ts.nothing }}</SearchLabel></template>
					</MkInput>
				</SearchMarker>

				<SearchMarker :keywords="['image']">
					<MkInput v-model="serverErrorImageUrl" type="url">
						<template #prefix><i class="ti ti-link"></i></template>
						<template #label><SearchLabel>{{ i18n.ts.somethingHappened }}</SearchLabel></template>
					</MkInput>
				</SearchMarker>
				<MkInput v-model="googleAnalyticsId" type="url">
					<template #label>GoogleAnalyticsId</template>
				</MkInput>
				<MkInput v-model="pointName">
					<template #label>{{ i18n.ts.pointName }}</template>
				</MkInput>
				<SearchMarker :keywords="['theme', 'color']">
					<MkColorInput v-model="themeColor">
						<template #label><SearchLabel>{{ i18n.ts.themeColor }}</SearchLabel></template>
					</MkColorInput>
				</SearchMarker>

				<SearchMarker :keywords="['theme', 'default', 'light']">
					<MkTextarea v-model="defaultLightTheme">
						<template #label><SearchLabel>{{ i18n.ts.instanceDefaultLightTheme }}
						</SearchLabel></template>
						<template #caption>{{ i18n.ts.instanceDefaultThemeDescription }}</template>
					</MkTextarea>
				</SearchMarker>

				<SearchMarker :keywords="['theme', 'default', 'dark']">
					<MkTextarea v-model="defaultDarkTheme">
						<template #label><SearchLabel>{{ i18n.ts.instanceDefaultDarkTheme }}</SearchLabel></template>
						<template #caption>
							{{ i18n.ts.instanceDefaultThemeDescription }}
						</template>
					</MkTextarea>
				</SearchMarker>

				<SearchMarker>
					<MkInput v-model="repositoryUrl" type="url">
						<template #prefix><i class="ti ti-link"></i></template>
						<template #label><SearchLabel>{{ i18n.ts.repositoryUrl }}</SearchLabel></template>
					</MkInput>
				</SearchMarker>

				<SearchMarker>
					<MkInput v-model="feedbackUrl" type="url">
						<template #prefix><i class="ti ti-link"></i></template>
						<template #label><SearchLabel>{{ i18n.ts.feedbackUrl }}</SearchLabel></template>
					</MkInput>
				</SearchMarker>

				<SearchMarker>
					<MkTextarea v-model="manifestJsonOverride">
						<template #label><SearchLabel>{{ i18n.ts._serverSettings.manifestJsonOverride }}
						</SearchLabel></template>
					</MkTextarea>
				</SearchMarker>
			</div>
		</SearchMarker>
	</div>
	<template #footer>
		<div :class="$style.footer">
			<div class="_spacer" style="--MI_SPACER-w: 700px; --MI_SPACER-min: 16px; --MI_SPACER-max: 16px;">
				<MkButton primary rounded @click="save">
						<i class="ti ti-check"></i> {{ i18n.ts.save }}
					</MkButton>
			</div>
		</div>
	</template>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import JSON5 from 'json5';
import { host } from '@@/js/config.js';
import MkInput from '@/components/MkInput.vue';
import MkTextarea from '@/components/MkTextarea.vue';
import * as os from '@/os.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { fetchInstance, instance } from '@/instance.js';
import { i18n } from '@/i18n.js';
import { definePage } from '@/page.js';
import MkButton from '@/components/MkButton.vue';
import MkColorInput from '@/components/MkColorInput.vue';
import { host } from '@@/js/config.js';
import MkFolder from '@/components/MkFolder.vue';

const meta = await misskeyApi('admin/meta');

const iconUrl = ref(meta.iconUrl);
const app192IconUrl = ref(meta.app192IconUrl);
const app512IconUrl = ref(meta.app512IconUrl);
const bannerUrl = ref(meta.bannerUrl);
const backgroundImageUrl = ref(meta.backgroundImageUrl);
const themeColor = ref(meta.themeColor);
const defaultLightTheme = ref(meta.defaultLightTheme);
const defaultDarkTheme = ref(meta.defaultDarkTheme);
const serverErrorImageUrl = ref(meta.serverErrorImageUrl);
const infoImageUrl = ref(meta.infoImageUrl);
const notFoundImageUrl = ref(meta.notFoundImageUrl);
const repositoryUrl = ref(meta.repositoryUrl);
const feedbackUrl = ref(meta.feedbackUrl);
const manifestJsonOverride = ref(meta.manifestJsonOverride === '' ? '{}' : JSON.stringify(JSON.parse(meta.manifestJsonOverride), null, '\t'));
const iconDark = ref<string | null>(meta.iconDark);
const iconLight = ref<string | null>(meta.iconLight);
const bannerDark = ref<string | null>(meta.bannerDark);
const bannerLight = ref<string | null>(meta.bannerLight);
const backgroundImageUrls = ref<string[]>(meta.backgroundImageUrl === '' ? '{}' : JSON.stringify(JSON.parse(meta.backgroundImageUrl), null, '\t'));
const pointName = ref<string | null>(meta.pointName);

function save() {
	os.apiWithDialog('admin/update-meta', {
		iconUrl: iconUrl.value,
		app192IconUrl: app192IconUrl.value,
		backgroundImageUrls: backgroundImageUrls.value,
		app512IconUrl: app512IconUrl.value,
		bannerUrl: bannerUrl.value,
		backgroundImageUrl: backgroundImageUrl.value,
		themeColor: themeColor.value === '' ? null : themeColor.value,
		defaultLightTheme:
			defaultLightTheme.value === '' ? null : defaultLightTheme.value,
		defaultDarkTheme:
			defaultDarkTheme.value === '' ? null : defaultDarkTheme.value,
		infoImageUrl: infoImageUrl.value === '' ? null : infoImageUrl.value,
		notFoundImageUrl:
			notFoundImageUrl.value === '' ? null : notFoundImageUrl.value,
		serverErrorImageUrl:
			serverErrorImageUrl.value === '' ? null : serverErrorImageUrl.value,
		googleAnalyticsId:
			googleAnalyticsId.value === '' ? null : googleAnalyticsId.value,
		repositoryUrl: repositoryUrl.value === '' ? null : repositoryUrl.value,
		feedbackUrl: feedbackUrl.value === '' ? null : feedbackUrl.value,
		manifestJsonOverride:
			manifestJsonOverride.value === ''
				? '{}'
				: JSON.stringify(JSON5.parse(manifestJsonOverride.value)),
		iconDark: iconDark.value === '' ? null : iconDark.value,
		iconLight: iconLight.value === '' ? null : iconLight.value,
		bannerDark: bannerDark.value === '' ? null : bannerDark.value,
		bannerLight: bannerLight.value === '' ? null : bannerLight.value,
		pointName: pointName.value === '' ? null : pointName.value,
	}).then(() => {
		fetchInstance(true);
	});
}

const headerTabs = computed(() => []);

definePage(() => ({
	title: i18n.ts.branding,
	icon: 'ti ti-paint',
}));
</script>

<style lang="scss" module>
.footer {
	-webkit-backdrop-filter: var(--MI-blur, blur(15px));
	backdrop-filter: var(--MI-blur, blur(15px));
}
</style>
