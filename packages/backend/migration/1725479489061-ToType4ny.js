/*
 * SPDX-FileCopyrightText:  Type4ny-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class ToType4ny1725479489061 {
	async up(queryRunner) {
		await queryRunner.query('UPDATE "meta" SET "repositoryUrl" = \'https://github.com/type4ny-project/type4ny\' WHERE "repositoryUrl" = \'https://github.com/misskey-dev/misskey\'');
		await queryRunner.query('UPDATE "meta" SET "feedbackUrl" = \'https://github.com/type4ny-project/type4ny/issues/new\' WHERE "repositoryUrl" = \'https://github.com/misskey-dev/misskey\'');
	}
	async down(queryRunner) {
		// none
	}
}
