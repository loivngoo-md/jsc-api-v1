import { SESSION_STATUS } from 'src/common/enums';
import { EntityHelper } from 'src/helpers/entity-helper';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { SystemConfiguration } from '../../system-configuration/entities/system-configuration.entity';

@Entity({ name: 'trading-session' })
export class TradingSession extends EntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: SESSION_STATUS.PENDING })
  status: SESSION_STATUS;

  @Column({ nullable: true })
  mor_start_time: Date;

  @Column({ nullable: true })
  mor_end_time: Date;

  @Column({ nullable: true })
  aft_start_time: Date;

  @Column({ nullable: true })
  aft_end_time: Date;

  @Column('varchar', { nullable: true })
  day_of_week: string;

  @Column('varchar', { nullable: true })
  date: string;

  @Column('json', { nullable: true })
  detail: SystemConfiguration;
}
