/*
 * SPDX-FileCopyrightText: syuilo and misskey-project , Type4ny-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import type { UserProfilesRepository, UsersRepository } from '@/models/_.js';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { UserEntityService } from '@/core/entities/UserEntityService.js';
import { DI } from '@/di-symbols.js';
import { NotificationService } from '@/core/NotificationService.js';
import { MetaService } from '@/core/MetaService.js';
import { RoleService } from '@/core/RoleService.js';
import { ApiError } from '../error.js';

export const meta = {
	tags: ['account'],

	requireCredential: true,
	kind: 'read:account',

	res: {
		type: 'object',
		optional: false, nullable: false,
		ref: 'MeDetailed',
	},

	errors: {
		userIsDeleted: {
			message: 'User is deleted.',
			code: 'USER_IS_DELETED',
			id: 'e5b3b9f0-2b8f-4b9f-9c1f-8c5c1b2e1b1a',
			kind: 'permission',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {},
	required: [],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		@Inject(DI.userProfilesRepository)
		private userProfilesRepository: UserProfilesRepository,
		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,

		private notificationService: NotificationService,
		private userEntityService: UserEntityService,
		private roleService: RoleService,
	) {
		super(meta, paramDef, async (ps, user, token) => {
			const isSecure = token == null;

			const now = new Date();
			const today = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`; //TODO: 日付変更の時間をサーバー管理者が設定できるように

			let todayGetPoints = 0;
			// 渡ってきている user はキャッシュされていて古い可能性があるので改めて取得
			const userProfile = await this.userProfilesRepository.findOne({
				where: {
					userId: user.id,
				},
				relations: ['user'],
			});

			if (userProfile == null) {
				throw new ApiError(meta.errors.userIsDeleted);
			}

			function generateSecureRandomNumber(min:number, max:number) {
				const range = max - min + 1;
				const randomBuffer = new Uint32Array(1);
				crypto.getRandomValues(randomBuffer);
				const randomNumber = randomBuffer[0] / (0xFFFFFFFF + 1);
				return Math.floor(randomNumber * range) + min;
			}

			if (!userProfile.loggedInDates.includes(today)) {
				if ((await this.roleService.getUserPolicies(user.id)).loginBonusGrantEnabled) {
					todayGetPoints = generateSecureRandomNumber(1, 5);

					const user_ = await this.usersRepository.findOne({
						where: {
							id: user.id,
						},
					});

					if (user_ == null) {
						throw new ApiError(meta.errors.userIsDeleted);
					}
					void this.usersRepository.update( user.id, {
						getPoints: user_.getPoints + todayGetPoints,
					});
					this.notificationService.createNotification(user.id, 'loginBonus', {
						loginBonus: todayGetPoints,
					});
				}

				void this.userProfilesRepository.update({ userId: user.id }, {
					loggedInDates: [...userProfile.loggedInDates, today],
				});
				userProfile.loggedInDates = [...userProfile.loggedInDates, today];
			}

			return await this.userEntityService.pack(userProfile.user!, userProfile.user!, {
				schema: 'MeDetailed',
				includeSecrets: isSecure,
				userProfile,
			});
		});
	}
}
