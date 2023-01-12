import { COMMON_STATUS } from 'src/common/enums';
import { EntityHelper } from 'src/helpers/entity-helper';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { SystemConfiguration } from '../../system-configuration/entities/system-configuration.entity';

@Entity({ name: 'trading-session' })
export class TradingSession extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ default: COMMON_STATUS.PENDING })
  status_nor: COMMON_STATUS;

  @Column({ default: COMMON_STATUS.PENDING })
  status_lar: COMMON_STATUS;

  @Column('varchar', { nullable: true })
  day_of_week: string;

  @Column('varchar', { nullable: true })
  date: string;

  @Column('json', { nullable: true })
  detail: SystemConfiguration;
}
