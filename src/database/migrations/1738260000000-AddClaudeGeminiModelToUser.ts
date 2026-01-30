import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClaudeGeminiModelToUser1738260000000 implements MigrationInterface {
	name = 'AddClaudeGeminiModelToUser1738260000000';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "claude_model" varchar(100) NULL`);
		await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "gemini_model" varchar(100) NULL`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "claude_model"`);
		await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "gemini_model"`);
	}
}
