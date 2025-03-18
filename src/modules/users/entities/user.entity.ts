// user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { ProfileAI } from './profile-ai.entity';
import { Image } from './image.entity';

@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  lastname: string;

  @Column({ nullable: true })
  link?: string;

  @Column({ nullable: true, type: 'int' })
  riskLevel?: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => ProfileAI, profile => profile.user, { cascade: true })
  profile: ProfileAI;

  @OneToMany(() => Image, image => image.user, { cascade: true })
  images: Image[];
}