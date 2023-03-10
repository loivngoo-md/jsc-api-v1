import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IPO_APP_STATUS } from '../../../common/enums';
import { EntityHelper } from '../../../helpers/entity-helper';

@Entity({ name: 'ipo-application' })
export class IpoApplication extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('integer')
  user_id: number;

  @Column('integer')
  ipo_id: number;

  @Column({ default: IPO_APP_STATUS.PENDING })
  status: IPO_APP_STATUS;

  @Column('float8')
  price: number;

  @Column('integer')
  quantity: number;

  @Column('integer', { default: 0 })
  actual_quantity: number;

  @Column('float8')
  amount: number;

  @Column('float8', { default: 0 })
  actual_amount: number;

  @Column('boolean', { default: true })
  is_active: boolean;

  @Column('boolean', { default: false })
  is_delete: boolean;
}
