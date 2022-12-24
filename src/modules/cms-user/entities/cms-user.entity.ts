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
}

export default CmsUser;
