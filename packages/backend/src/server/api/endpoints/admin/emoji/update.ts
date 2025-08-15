/*
 * SPDX-FileCopyrightText: syuilo and misskey-project , Type4ny-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { DriveFileEntityService } from '@/core/entities/DriveFileEntityService.js';
import { CustomEmojiService } from '@/core/CustomEmojiService.js';
import type { DriveFilesRepository, EmojisRepository } from '@/models/_.js';
import { DI } from '@/di-symbols.js';
import { ApiError } from '../../../error.js';

export const meta = {
	tags: ['admin'],

	requireCredential: true,
	requiredRolePolicy: 'canManageCustomEmojis',
	kind: 'write:admin:emoji',

	errors: {
		noSuchEmoji: {
			message: 'No such emoji.',
			code: 'NO_SUCH_EMOJI',
			id: '684dec9d-a8c2-4364-9aa8-456c49cb1dc8',
		},
		noSuchFile: {
			message: 'No such file.',
			code: 'NO_SUCH_FILE',
			id: '14fb9fd9-0731-4e2f-aeb9-f09e4740333d',
		},
		sameNameEmojiExists: {
			message: 'Emoji that have same name already exists.',
			code: 'SAME_NAME_EMOJI_EXISTS',
			id: '7180fe9d-1ee3-bff9-647d-fe9896d2ffb8',
		},
		duplicationEmojiAdd: {
			message: 'This emoji is already added.',
			code: 'DUPLICATION_EMOJI_ADD',
			id: 'mattyaski_emoji_duplication_error',
		},
	},
} as const;

export const paramDef = {
	allOf: [
		{
			anyOf: [
				{
					type: 'object',
					properties: {
						id: { type: 'string', format: 'misskey:id' },
					},
					required: ['id'],
				},
				{
					type: 'object',
					properties: {
						name: { type: 'string', pattern: '^[a-zA-Z0-9_]+$' },
					},
					required: ['name'],
				},
			],
		},
		{
			type: 'object',
			properties: {
				fileId: { type: 'string', format: 'misskey:id' },
				category: {
					type: 'string',
					nullable: true,
					description: 'Use `null` to reset the category.',
				},
				aliases: { type: 'array', items: {
					type: 'string',
				} },
				license: { type: 'string', nullable: true },
				isSensitive: { type: 'boolean' },
				localOnly: { type: 'boolean' },
				roleIdsThatCanBeUsedThisEmojiAsReaction: { type: 'array', items: {
					type: 'string',
				} },
			Request: { type: 'boolean' },},
		},
	],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		@Inject(DI.driveFilesRepository)
		private driveFilesRepository: DriveFilesRepository,
		private customEmojiService: CustomEmojiService,
		private driveFileEntityService: DriveFileEntityService,
	) {
		super(meta, paramDef, async (ps, me) => {
			let driveFile;
			const isRequest = !!ps.Request;
			if (ps.fileId) {
				driveFile = await this.driveFilesRepository.findOneBy({ id: ps.fileId });
				if (driveFile == null) throw new ApiError(meta.errors.noSuchFile);
			}

			const required = 'id' in ps
				? { id: ps.id, name: 'name' in ps ? ps.name as string : undefined }
				: { name: ps.name };

			const params = ps as any;
			let emojiId, emoji;
			if (params.id) {
				emojiId = params.id;
				const emoji = await this.customEmojiService.getEmojiById(params.id);
				if (!emoji) throw new ApiError(meta.errors.noSuchEmoji);
				if (params.name && (params.name !== emoji.name)) {
					const isDuplicate = await this.customEmojiService.checkDuplicate(params.name);
					if (isDuplicate) throw new ApiError(meta.errors.sameNameEmojiExists);
				}
			} else {
				if (!params.name) throw new Error('Invalid Params unexpectedly passed. This is a BUG. Please report it to the development team.');
				emoji = await this.customEmojiService.getEmojiByName(params.name);
				if (!emoji) throw new ApiError(meta.errors.noSuchEmoji);
				emojiId = emoji.id;
			}

			if (!isRequest) {
				await this.customEmojiService.update({
					id: emojiId,
					originalUrl: driveFile != null ? driveFile.url : undefined,
				publicUrl: driveFile != null ? (driveFile.webpublicUrl ?? driveFile.url) : undefined,
				fileType: driveFile != null ? (driveFile.webpublicType ?? driveFile.type) : undefined,
					name: params.name,
					category: params.category,
					aliases: params.aliases,
					license: params.license,
					isSensitive: params.isSensitive,
					localOnly: params.localOnly,
					roleIdsThatCanBeUsedThisEmojiAsReaction: params.roleIdsThatCanBeUsedThisEmojiAsReaction,
				}, me);
			} else {
				if (!emoji) throw new Error('Invalid Params unexpectedly passed. This is a BUG. Please report it to the development team.');
				const file = await this.driveFileEntityService.getFromUrl(emoji.originalUrl);
				if (file === null) throw new ApiError(meta.errors.noSuchFile);
				if (!params.name) throw new Error('Invalid Params unexpectedly passed. This is a BUG. Please report it to the development team.');
				if (!params.id) throw new Error('Invalid Params unexpectedly passed. This is a BUG. Please report it to the development team.');

				await this.customEmojiService.request({
					driveFile: file,
					name: params.name,
					category: params.category ?? null,
					aliases: params.aliases ?? [],
					license: params.license ?? null,
					isSensitive: params.isSensitive ?? false,
					localOnly: params.localOnly ?? false,
				}, me);
				await this.customEmojiService.delete(params.id);
			}
		});
	}
}
