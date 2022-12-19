import { DEPOSIT_WITHDRAWAL_STATUS } from 'src/common/enums';
import { EntityHelper } from 'src/helpers/entity-helper';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'withdraw' })
export class Withdraw extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('integer')
  user_id: number;

  @Column('varchar')
  username: string;

  @Column('float8')
  amount: number;

  @Column('float8', { default: 0 })
  fee_rate: number;

  @Column('float8')
  actual_amount: number;

  @Column('varchar', { default: DEPOSIT_WITHDRAWAL_STATUS.PENDING })
  status: DEPOSIT_WITHDRAWAL_STATUS;

  @Column('varchar', { default: '' })
  comments: string;

  @Column('varchar', { default: '' })
  remark: string;

  @Column('varchar', { default: '' })
  reviewed_by: string;

  @Column({ nullable: true })
  reviewed_at: Date;
}
