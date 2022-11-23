import { EntityHelper } from 'src/helpers/entity-helper';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Decimal } from 'decimal.js';

@Entity({ name: 'transactions' })
class Transaction extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  type: string;

  @Column('decimal')
  amount: Decimal;

  @Column()
  before: string;

  @Column()
  after: string;

  @Column({ nullable: true })
  quantity: number;

  @Column()
  remarks: string;

  @Column()
  created_at: Date;
}

export default Transaction;
