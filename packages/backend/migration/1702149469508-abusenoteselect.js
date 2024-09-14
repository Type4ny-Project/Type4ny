/*
 * SPDX-FileCopyrightText: syuilo and misskey-project , Type4ny-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class Abusenoteselect1702149469508 {
	name = 'Abusenoteselect1702149469508';

	async up(queryRunner) {
		await queryRunner.query('ALTER TABLE "abuse_user_report" ADD "notes" jsonb NOT NULL DEFAULT \'[]\'');
	}

	async down(queryRunner) {
		await queryRunner.query('ALTER TABLE "abuse_user_report" DROP COLUMN "notes"');
	}
}