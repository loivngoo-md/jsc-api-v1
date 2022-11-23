import { EntityHelper } from 'src/helpers/entity-helper';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'login_record' })
class LoginRecord extends EntityHelper {
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

}

export default LoginRecord;
