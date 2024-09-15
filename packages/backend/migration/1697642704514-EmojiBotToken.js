/*
 * SPDX-FileCopyrightText: Type4ny-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class EmojiBotToken1697642704514 {
	name = 'EmojiBotToken1697642704514';

	async up(queryRunner) {
		await queryRunner.query('ALTER TABLE "meta" ADD "EmojiBotToken" character varying(1024)');
	}

	async down(queryRunner) {
		await queryRunner.query('ALTER TABLE "meta" DROP COLUMN "EmojiBotToken"');
	}
}
