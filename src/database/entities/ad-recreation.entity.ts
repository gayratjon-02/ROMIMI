import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum AdRecreationStatus {
	UPLOADED = 'uploaded',
	ANALYZING = 'analyzing',
	ANALYZED = 'analyzed',
	GENERATING = 'generating',
	COMPLETED = 'completed',
	FAILED = 'failed',
}

@Entity('ad_recreations')
export class AdRecreation {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ type: 'varchar', length: 500 })
	competitor_ad_url: string;

	@Column({ type: 'text', nullable: true })
	brand_brief: string;

	@Column({ type: 'jsonb', nullable: true })
	brand_references: any; // Array of reference images/URLs

	@Column({ type: 'int', default: 3 })
	variations_count: number;

	@Column({
		type: 'enum',
		enum: AdRecreationStatus,
		default: AdRecreationStatus.UPLOADED,
	})
	status: AdRecreationStatus;

	@Column({ type: 'jsonb', nullable: true })
	analysis_result: any; // Claude analysis result

	@Column({ type: 'jsonb', nullable: true })
	generated_variations: any; // Array of generated ad variations

	@Column({ type: 'text', nullable: true })
	error_message: string;

	@CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	created_at: Date;

	@UpdateDateColumn({
		type: 'timestamp',
		default: () => 'CURRENT_TIMESTAMP',
		onUpdate: 'CURRENT_TIMESTAMP',
	})
	updated_at: Date;

	@Column({ type: 'timestamp', nullable: true })
	completed_at: Date;

	@ManyToOne(() => User, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'user_id' })
	user: User;

	@Column({ type: 'uuid' })
	user_id: string;
}