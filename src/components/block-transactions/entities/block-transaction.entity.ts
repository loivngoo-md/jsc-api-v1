import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { COMMON_STATUS } from '../../../common/enums';
import { EntityHelper } from '../../../helpers/entity-helper';

@Entity('block-transaction')
export class BlockTransaction extends EntityHelper {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('integer')
  stock_code: number;

  @Column('varchar')
  stock_name: string;

  @Column('integer')
  quantity: number;

  @Column('varchar')
  trx_key: string;

  @Column('float')
  discount: number;

  @Column('bigint')
  start_time: number;

  @Column('bigint')
  end_time: number;

  @Column('varchar', { default: COMMON_STATUS.PENDING })
  status: COMMON_STATUS;

  @Column('boolean', { default: true })
  is_active: boolean;

  @Column('boolean', { default: false })
  is_delete: boolean;

  @Column('integer', { default: 0 })
  increase_ratio: number;
}
