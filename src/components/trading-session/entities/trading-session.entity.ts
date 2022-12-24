import { SESSION_STATUS } from 'src/common/enums';
import { EntityHelper } from 'src/helpers/entity-helper';
import { Column, Entity, PrimaryGeneratedColumn, Timestamp } from 'typeorm';
import { SystemConfiguration } from '../../system-configuration/entities/system-configuration.entity';

@Entity({ name: 'trading-session' })
export class TradingSession extends EntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: SESSION_STATUS.PENDING })
  status: SESSION_STATUS;

  @Column({ nullable: true, type: 'timestamptz' })
  mor_start_time: Timestamp;

  @Column({ nullable: true, type: 'timestamptz' })
  mor_end_time: Timestamp;

  @Column({ nullable: true, type: 'timestamptz' })
  aft_start_time: Timestamp;

  @Column({ nullable: true, type: 'timestamptz' })
  aft_end_time: Timestamp;

  @Column('varchar', { nullable: true })
  day_of_week: string;

  @Column('varchar', { nullable: true })
  date: string;

  @Column('json', { nullable: true })
  detail: SystemConfiguration;
}
