/*
 * SPDX-FileCopyrightText: Type4ny-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class Meta1723290939001 {
    name = 'Meta1723290939001'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" ADD "backgroundImageUrls" jsonb NOT NULL DEFAULT '[]'`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "backgroundImageUrls"`);
    }
}
