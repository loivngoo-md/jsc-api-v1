import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { EntityHelper } from '../../../helpers/entity-helper';

@Entity('agent')
export class Agent extends EntityHelper {
  @PrimaryGeneratedColumn('increment')
  public id: number;

  @PrimaryGeneratedColumn('uuid')
  public code: string;

  @Column({ default: null })
  public username: string;

  @Column({ default: null })
  public password: string;

  @Column({ default: null })
  public real_name: string;

  @Column({ default: null })
  public phone: string;

  @Column({ default: true })
  public is_active: boolean;

  @Column({ default: null })
  public parent: number;

  @Column({ default: null })
  public parent_name: string;

  @Column({ default: 0 })
  public level: number;

  @Column({ default: 0 })
  public poundage_scale: number;

  @Column({ default: 0 })
  public deferred_fees_scale: number;

  @Column({ default: 0 })
  public receive_dividends_scale: number;

  @Column({ default: 0 })
  public total_money: number;

  @Column({ default: null })
  public site_level: string;

  @Column({ default: null })
  public path: string;

  @Column({ default: false })
  public is_delete: boolean;
}
