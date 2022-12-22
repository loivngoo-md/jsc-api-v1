import { DEPOSIT_WITHDRAWAL_STATUS } from 'src/common/enums';
import { EntityHelper } from 'src/helpers/entity-helper';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export class ColumnNumericTransformer {
  to(data: number): number {
    return data;
  }
  from(data: string): number {
    return parseFloat(data);
  }
}

@Entity({ name: 'deposit' })
class Deposit extends EntityHelper {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('integer')
  user_id: number;

  @Column('varchar')
  username: string;

  @Column('float8')
  amount: number;

  @Column('varchar', { default: DEPOSIT_WITHDRAWAL_STATUS.PENDING })
  status: DEPOSIT_WITHDRAWAL_STATUS;

  @Column('integer')
  deposit_account_id: number;

  @Column('boolean', { default: false })
  is_virtual_deposit: boolean;

  @Column('varchar', { default: '' })
  comments: string;

  @Column('varchar', { default: '' })
  remark: string;

  @Column('varchar', { default: '' })
  reviewed_by: string;

  @Column({ nullable: true })
  reviewed_at: Date;
}

export default Deposit;
