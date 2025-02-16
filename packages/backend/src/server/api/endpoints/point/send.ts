/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import type { UsersRepository } from '@/models/_.js';
import { DI } from '@/di-symbols.js';
import { NotificationService } from '@/core/NotificationService.js';

export const meta = {
	tag: ['point'],
	requireCredential: true,
	kind: 'write:points',
	secure: true,
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		userId: { type: 'string', format: 'misskey:id' },
		points: { type: 'number' },
	},
	required: ['userId', 'points'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,
		private notificationService: NotificationService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const sender = await this.usersRepository.findOneBy({ id: me.id });
			const user = await this.usersRepository.findOneBy({ id: ps.userId });

			if (sender == null || user == null) {
				throw new Error('user not found');
			}
			//送れるかどうかチェック
			if (sender.getPoints < ps.points) {
				throw new Error('not enough points');
			}

			//ポイントを送る
			await this.usersRepository.update(sender.id, {
				getPoints: sender.getPoints - ps.points,
			});
			await this.usersRepository.update(user.id, {
				getPoints: user.getPoints + ps.points,
			});

			this.notificationService.createNotification(user.id, 'acceptPoints', {
				getPoint: ps.points,
			}, sender.id);

			return {};
		});
	}
}
