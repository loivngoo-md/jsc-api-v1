import { EntityHelper } from 'src/helpers/entity-helper';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'cms_users' })
class CmsUser extends EntityHelper {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ nullable: false })
  public username: string;

  @Column({ nullable: false })
  public password: string;

  @Column({ nullable: true })
  public phone: string;

  @Column({ nullable: true })
  public real_name: string;

  @Column({ default: true, nullable: true })
  public is_active: boolean;
}

export default CmsUser;
