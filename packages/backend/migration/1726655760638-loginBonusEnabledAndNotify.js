/*
 * SPDX-FileCopyrightText:  Type4ny-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class LoginBonusEnabledAndNotify1726655760638 {
	name = 'LoginBonusEnabledAndNotify1726655760638';

	async up(queryRunner) {
		await queryRunner.query('ALTER TABLE "meta" ADD "enableLoginBonus" boolean NOT NULL DEFAULT true');
	}

	async down(queryRunner) {
		await queryRunner.query('ALTER TABLE "meta" DROP COLUMN "enableLoginBonus"');
	}
}
