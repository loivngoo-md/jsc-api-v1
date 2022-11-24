import { EntityHelper } from 'src/helpers/entity-helper';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'login_record' })
class LoginRecord extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("bigint")
  user_id: number;

  @Column("varchar",{ nullable: true })
  password: string;

  @Column("varchar", { default: 'N/A' })
  ip: string;

  @Column("varchar", { default: 'N/A' })
  location: string;

}

export default LoginRecord;
