/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PrimaryColumn, Entity, Index, Column } from 'typeorm';
import { id } from './util/id.js';

@Entity('emoji_draft')
@Index(['name'], { unique: true })
export class MiEmojiDraft {
	@PrimaryColumn(id())
	public id: string;

	@Column('timestamp with time zone', {
		nullable: true,
	})
	public updatedAt: Date | null;

	@Column('varchar', {
		length: 128,
	})
	public name: string;

	@Column('varchar', {
		length: 128, nullable: true,
	})
	public category: string | null;

	@Column('varchar', {
		length: 512,
	})
	public originalUrl: string;

	@Column('varchar', {
		length: 512,
		default: '',
	})
	public publicUrl: string;

	// publicUrlの方のtypeが入る
	@Column('varchar', {
		length: 64, nullable: true,
	})
	public type: string | null;

	@Column('varchar', {
		array: true, length: 128, default: '{}',
	})
	public aliases: string[];

	@Column('varchar', {
		length: 1024, nullable: true,
	})
	public license: string | null;

	@Column('varchar', {
		length: 1024, nullable: false,
	})
	public fileId: string;

	@Column('boolean', {
		default: false,
	})
	public localOnly: boolean;

	@Column('boolean', {
		default: false,
	})
	public isSensitive: boolean;
}
