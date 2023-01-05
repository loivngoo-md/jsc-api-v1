import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IPO_STOCK_TYPE } from '../../../common/enums';
import { EntityHelper } from '../../../helpers/entity-helper';

@Entity({ name: 'ipo-stock' })
export class IpoStock extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  name: string;

  @Column('varchar')
  code: string;

  @Column('integer', { default: IPO_STOCK_TYPE.沪 })
  type: IPO_STOCK_TYPE;

  @Column('float')
  price: number;

  @Column('integer', { default: 0 })
  purchase_quantity: number;

  @Column('integer')
  supply_quantity: number;

  @Column('bigint')
  time_on_market: number;

  @Column('bigint')
  subscribe_time: number;

  @Column('bigint')
  payment_time: number;

  @Column('boolean')
  is_active: boolean;

  @Column('integer', { nullable: true })
  pe: number;

  @Column('integer', { default: 0 })
  zt: number;

  @Column('boolean', { default: false })
  is_delete: boolean;
}
