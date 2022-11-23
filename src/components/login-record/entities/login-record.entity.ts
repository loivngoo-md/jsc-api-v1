import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'login_record' })
class LoginRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: string;

  @Column({ nullable: true })
  password: string;

  @Column()
  ip: string;

  @Column({ default: 'N/A' })
  location: string;

  @Column({ default: new Date() })
  created_at: Date;
}

export default LoginRecord;
