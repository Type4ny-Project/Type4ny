/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class RemoveNoteConstraints1753868431598 {
    name = 'RemoveNoteConstraints1753868431598'

    async up(queryRunner) {
        // Check if constraints exist before dropping them
        const constraints = await queryRunner.query(`
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name = 'note' 
            AND constraint_type = 'FOREIGN KEY'
            AND constraint_name IN ('FK_52ccc804d7c69037d558bac4c96', 'FK_17cb3553c700a4985dff5a30ff5')
        `);
        
        for (const constraint of constraints) {
            await queryRunner.query(`ALTER TABLE "note" DROP CONSTRAINT "${constraint.constraint_name}"`);
        }
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "note" ADD CONSTRAINT "FK_17cb3553c700a4985dff5a30ff5" FOREIGN KEY ("replyId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "note" ADD CONSTRAINT "FK_52ccc804d7c69037d558bac4c96" FOREIGN KEY ("renoteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
}
