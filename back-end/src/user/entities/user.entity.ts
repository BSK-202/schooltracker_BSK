import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('user')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    phone: string;

    @Column()
    password: string;

    @Column()
    full_name: string;

    @Column()
    role: string;

    @CreateDateColumn()
    created_at:Date;
}