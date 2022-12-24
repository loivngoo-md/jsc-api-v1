import { EntityHelper } from 'src/helpers/entity-helper';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'deposit_accounts' })
class DepositAccount extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  bank_name: string;

  @Column()
  branch: string;

  @Column()
  bank_card: string;

  @Column()
  account_holder: string;

  @Column()
  account_number: string;

  @Column({ default: true })
  is_public: boolean;

  @Column({ default: true })
  is_enabled: boolean;
}

export default DepositAccount;
