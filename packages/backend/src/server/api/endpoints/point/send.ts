/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import type { UsersRepository } from '@/models/_.js';
import { DI } from '@/di-symbols.js';
import { NotificationService } from '@/core/NotificationService.js';
import { RoleService } from '@/core/RoleService.js';
import { ApiError } from '../../error.js';

export const meta = {
	tag: ['point'],
	requireCredential: true,
	kind: 'write:points',
	secure: true,
	errors: {
		userIsNotFound: {
			message: 'user is not found.',
			code: 'USER_IS_NOT_FOUND',
			id: '87472165-2e39-fcb9-352b-98c24a6d825e',
		},
		notEnoughPoints: {
			message: 'not enough points.',
			code: 'NOT_ENOUGH_POINTS',
			id: '10e9f46d-9f1f-7a4b-801b-5fe88e4bb1aa',
		},
		cannotSendPoints: {
			message: 'cannot send points.',
			code: 'CANNOT_SEND_POINTS',
			id: 'f1cf2616-db7b-3f97-5a14-06a0a0005f8f',
		},
		recipientIsYou: {
			message: 'recipient is you.',
			code: 'RECIPIENT_IS_ME',
			id: '24095319-69ee-8033-b0a2-9ad6928bbcb8',
		},
	},

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
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,
		private notificationService: NotificationService,
		private roleService: RoleService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const sender = await this.usersRepository.findOneBy({ id: me.id });
			const user = await this.usersRepository.findOneBy({ id: ps.userId });

			if (sender == null || user == null) {
				throw new ApiError(meta.errors.userIsNotFound);
			}

			if ((await this.roleService.getUserPolicies(sender.id)).canSendPoints === false) {
				throw new ApiError(meta.errors.cannotSendPoints);
			}
			//送れるかどうかチェック
			if (sender.getPoints < ps.points) {
				throw new ApiError(meta.errors.notEnoughPoints);
			}

			// 受信者が自分ならエラー
			if (sender.id === user.id) {
				throw new ApiError(meta.errors.recipientIsYou);
			}

			// 送るポイントが0以下の場合はエラー
			if (ps.points <= 0) {
				throw new ApiError(meta.errors.cannotSendPoints);
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
