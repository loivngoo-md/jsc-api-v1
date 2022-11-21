import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'login_record' })
class LoginRecord {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column({ nullable: true })
    password: string;

    @Column()
    ip: string;

    @Column({ default: null })
    location: string;

    @Column()
    created_at : Date;

}

export default LoginRecord;