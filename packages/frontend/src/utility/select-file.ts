/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as Misskey from 'misskey-js';
import { ref } from 'vue';
import * as os from '@/os.js';
import { i18n } from '@/i18n.js';
import { store } from '@/store.js';
import { uploadFile } from '@/utility/upload.js';

export function selectFile(src: any, label: string | null = null): Promise<Misskey.entities.DriveFile> {
	return select(src, label, false) as Promise<Misskey.entities.DriveFile>;
}

export function selectFiles(src: any, label: string | null = null): Promise<Misskey.entities.DriveFile[]> {
	return select(src, label, true) as Promise<Misskey.entities.DriveFile[]>;
}

async function select(src: any, label: string | null, multiple: boolean): Promise<Misskey.entities.DriveFile | Misskey.entities.DriveFile[]> {
	const fileInput = document.createElement('input');
	fileInput.type = 'file';
	fileInput.multiple = multiple;
	if (label) {
		fileInput.accept = label;
	}

	return new Promise((resolve, reject) => {
		fileInput.addEventListener('change', async () => {
			if (!fileInput.files || fileInput.files.length === 0) {
				reject();
				return;
			}

			const promises = Array.from(fileInput.files).map(file => uploadFile(file, store.s.uploadFolder));
			
			if (multiple) {
				Promise.all(promises).then(resolve).catch(reject);
			} else {
				promises[0].then(resolve).catch(reject);
			}
		});
		
		fileInput.click();
	});
}