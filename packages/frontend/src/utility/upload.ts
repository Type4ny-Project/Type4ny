/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as Misskey from 'misskey-js';
import { reactive, ref } from 'vue';
import * as os from '@/os.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { i18n } from '@/i18n.js';
import { $i } from '@/i.js';

type UploadItem = {
	id: string;
	name: string;
	size: number;
	file: File;
	progressValue: number;
	progressMax: number;
	img?: string;
	warn: boolean;
	completed: boolean;
};

export const uploads = ref<UploadItem[]>([]);

export function uploadFile(
	file: File,
	folder?: string | null,
	name?: string,
	keepOriginal?: boolean
): Promise<Misskey.entities.DriveFile> {
	if (folder && typeof folder === 'object') folder = (folder as any).id;

	return new Promise((resolve, reject) => {
		const id = Math.random().toString();
		
		const uploadItem: UploadItem = reactive({
			id,
			name: name || file.name || 'untitled',
			size: file.size,
			file,
			progressValue: 0,
			progressMax: 0,
			img: undefined,
			warn: false,
			completed: false,
		});
		
		uploads.value.push(uploadItem);
		
		const reader = new FileReader();
		reader.onload = async () => {
			const formData = new FormData();
			formData.append('file', file);
			if (folder) formData.append('folderId', folder);
			if (name) formData.append('name', name);
			formData.append('force', 'true');
			formData.append('isSensitive', 'false');
			if ($i) formData.append('i', $i.token);
			
			const xhr = new XMLHttpRequest();
			xhr.open('POST', '/api/drive/files/create', true);
			xhr.onload = () => {
				if (xhr.status !== 200 && xhr.status !== 201 && xhr.status !== 204) {
					uploads.value = uploads.value.filter(x => x.id !== id);
					reject(xhr.statusText);
					return;
				}
				
				const body = xhr.responseText;
				if (body) {
					const res = JSON.parse(body);
					uploadItem.completed = true;
					uploads.value = uploads.value.filter(x => x.id !== id);
					resolve(res);
				}
			};
			
			xhr.upload.onprogress = e => {
				if (e.lengthComputable) {
					uploadItem.progressValue = e.loaded;
					uploadItem.progressMax = e.total;
				}
			};
			
			xhr.onerror = () => {
				uploads.value = uploads.value.filter(x => x.id !== id);
				reject('upload error');
			};
			
			xhr.send(formData);
		};
		reader.readAsArrayBuffer(file);
	});
}