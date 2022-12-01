import Decimal from 'decimal.js';
import { EntityHelper } from 'src/helpers/entity-helper';
import { AfterLoad, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column('float8')
  amount: number;

  @Column('integer')
  deposit_account_id: number;

  @Column('boolean', { default: false })
  is_reviewed: boolean;

  @Column('boolean', { default: false })
  is_virtual_deposit: boolean;

  @Column('varchar', { default: '' })
  comments: string;

  @Column('varchar', { default: '' })
  remark: string;

}

export default Deposit;
