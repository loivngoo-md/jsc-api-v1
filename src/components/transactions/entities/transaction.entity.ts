import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TRANSACTION_TYPE } from '../../../common/enums';
import { EntityHelper } from '../../../helpers/entity-helper';

@Entity({ name: 'transactions' })
export class Transaction extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: TRANSACTION_TYPE;

  @Column()
  trx_id: number;

  @Column()
  user_id: number;

  @Column()
  before: number;

  @Column()
  after: number;
}
