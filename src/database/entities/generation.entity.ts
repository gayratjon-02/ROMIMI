import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Collection } from './collection.entity';
import { GenerationType, GenerationStatus } from '../../libs/enums';

@Entity('generations')
export class Generation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  product_id: string;

  @ManyToOne(() => Product, (product) => product.generations)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'uuid' })
  collection_id: string;

  @ManyToOne(() => Collection)
  @JoinColumn({ name: 'collection_id' })
  collection: Collection;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({
    type: 'enum',
    enum: GenerationType,
  })
  generation_type: GenerationType;

  @Column({ type: 'varchar', length: 10, default: '4:5' })
  aspect_ratio: string;

  @Column({ type: 'varchar', length: 10, default: '4K' })
  resolution: string;

  @Column({ type: 'jsonb', nullable: true })
  visuals: any[];

  @Column({
    type: 'enum',
    enum: GenerationStatus,
    default: GenerationStatus.PENDING,
  })
  status: GenerationStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  competitor_ad_url: string;

  @Column({ type: 'jsonb', nullable: true })
  competitor_analysis: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;
}
