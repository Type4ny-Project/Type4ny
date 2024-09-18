/*
 * SPDX-FileCopyrightText:  Type4ny-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class LoginBonusVisibility1726658476990 {
	name = 'LoginBonusVisibility1726658476990';

	async up(queryRunner) {
		await queryRunner.query('ALTER TABLE "user_profile" ADD "loginBonusIsVisible" boolean NOT NULL DEFAULT true');
	}

	async down(queryRunner) {
		await queryRunner.query('ALTER TABLE "user_profile" DROP COLUMN "loginBonusIsVisible"');
	}
}
