/*
 * SPDX-FileCopyrightText:  Type4ny-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class ToType4ny1725479489061 {
	async up(queryRunner) {
		await queryRunner.query('UPDATE "meta" SET "repositoryUrl" = \'https://github.com/misskey-dev/misskey\'');
		await queryRunner.query('UPDATE "meta" SET "feedbackUrl" = \'https://github.com/type4ny-project/type4ny/issues/new\'');
		await queryRunner.query('UPDATE "meta" SET "preservedUsernames" = \'{ "admin", "administrator", "root", "system", "maintainer", "host", "mod", "moderator", "owner", "superuser", "staff", "auth", "i", "me", "everyone", "all", "mention", "mentions", "example", "user", "users", "account", "accounts", "official", "help", "helps", "support", "supports", "info", "information", "informations", "announce", "announces", "announcement", "announcements", "notice", "notification", "notifications", "dev", "developer", "developers", "tech", "misskey", "type4ny","fedihost" }\'');
	}
	async down(queryRunner) {
		// none
	}
}
