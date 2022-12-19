import { SESSION_STATUS } from 'src/common/enums';
import { EntityHelper } from 'src/helpers/entity-helper';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'trading-session' })
export class TradingSession extends EntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  status: SESSION_STATUS;

  @Column()
  start_time: Date;

  @Column()
  end_time: Date;
}
