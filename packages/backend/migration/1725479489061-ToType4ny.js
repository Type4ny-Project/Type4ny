/*
 * SPDX-FileCopyrightText:  Type4ny-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class ToType4ny1725479489061 {
	async up(queryRunner) {
		await queryRunner.query('ALTER TABLE "meta" ADD "repositoryUrl" character varying(512) NOT NULL DEFAULT \'https://github.com/type4ny-project/type4ny\'');
		await queryRunner.query('ALTER TABLE "meta" ADD "feedbackUrl" character varying(512) DEFAULT \'https://github.com/type4ny-project/type4ny/issues/new\'');
		await queryRunner.query('ALTER TABLE "meta" ALTER COLUMN "preservedUsernames" SET DEFAULT \'{ "admin", "administrator", "root", "system", "maintainer", "host", "mod", "moderator", "owner", "superuser", "staff", "auth", "i", "me", "everyone", "all", "mention", "mentions", "example", "user", "users", "account", "accounts", "official", "help", "helps", "support", "supports", "info", "information", "informations", "announce", "announces", "announcement", "announcements", "notice", "notification", "notifications", "dev", "developer", "developers", "tech", "misskey", "type4ny","fedihost" }\'');
	}
	async down(queryRunner) {
		await queryRunner.query('ALTER TABLE "meta" DROP COLUMN "feedbackUrl"');
		await queryRunner.query('ALTER TABLE "meta" DROP COLUMN "repositoryUrl"');
	}
}
