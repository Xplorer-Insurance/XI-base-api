// profile-ai.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('perfiles_ai')
export class ProfileAI {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.profile)
  user: User;

  @Column()
  actividad_detectada: string;

  @Column({ type: 'int' })
  riesgo: number;

  @Column({ type: 'jsonb' })
  metadata: any;

  @CreateDateColumn()
  createdAt: Date;
}