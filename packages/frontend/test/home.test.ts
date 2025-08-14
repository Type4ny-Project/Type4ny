/*
 * SPDX-FileCopyrightText: syuilo and misskey-project , Type4ny-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { afterEach, assert, describe, test } from 'vitest';
import { cleanup, render, type RenderResult } from '@testing-library/vue';
import './init';
import * as Misskey from 'misskey-js';
import { directives } from '@/directives/index.js';
import { components } from '@/components/index.js';
import XHome from '@/pages/user/home.vue';
import { userDetailed } from '@/../.storybook/fakes.js';
import 'intersection-observer';

describe('XHome', () => {
	const renderHome = (user: Misskey.entities.UserDetailed | Misskey.entities.MeDetailed): RenderResult => {
		return render(XHome, {
			props: { user, disableNotes: true },
			global: { directives, components },
		});
	};

	afterEach(() => {
		cleanup();
	});

	test('Should render the remote caution when user.host exists', async () => {
		const home = renderHome({
			...userDetailed('blobcat', 'blobcat', 'example.com'),
			uri: 'https://example.com/@user',
			url: 'https://example.com/@user/profile',
		});

		const anchor = home.container.querySelector<HTMLAnchorElement>('a[href^="https://example.com/"]');
		assert.exists(anchor, 'anchor to the remote exists');
		assert.strictEqual(anchor?.href, 'https://example.com/@user/profile');
	});

	test('The remote caution should fall back to uri if url is null', async () => {
		const home = renderHome({
			...userDetailed('blobcat', 'blobcat', 'example.com'),
			uri: 'https://example.com/@user',
			url: null,
		});

		const anchor = home.container.querySelector<HTMLAnchorElement>('a[href^="https://example.com/"]');
		assert.exists(anchor, 'anchor to the remote exists');
		assert.strictEqual(anchor?.href, 'https://example.com/@user');
	});
});
