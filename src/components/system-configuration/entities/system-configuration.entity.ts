import { EntityHelper } from 'src/helpers/entity-helper';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import {
  IDepositsAndWithdrawals,
  INewShares,
  ITradingHours,
  ITransactionsRate,
} from './system-configuration.interface';

@Entity({ name: 'system_configuration' })
export class SystemConfiguration extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'json' })
  deposits_and_withdrawals: IDepositsAndWithdrawals[];

  @Column({ type: 'json' })
  transactions_rate: ITransactionsRate[];

  @Column({ type: 'json' })
  trading_hours: ITradingHours[];

  @Column({ type: 'json' })
  new_shares: INewShares[];

  @Column({ type: 'text' })
  online_customer_service: string;

  @Column({ default: false, type: 'boolean' })
  is_main_config: boolean;
}
