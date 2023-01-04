import { EntityHelper } from 'src/helpers/entity-helper';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'app_users' })
class AppUser extends EntityHelper {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ nullable: false })
  public username: string;

  @Column({ nullable: false })
  public password: string;

  @Column({ nullable: true })
  public withdraw_password: string;

  @Column({ default: true })
  public is_real: boolean;

  @Column({ default: false })
  public is_verified: boolean;

  @Column({ default: null })
  public real_name: string;

  @Column({ nullable: true })
  public id_front?: string;

  @Column({ nullable: true })
  public id_back?: string;

  @Column({ default: null })
  public id_number: string;

  @Column({ default: null })
  public phone: string;

  @Column({ default: null })
  public bank_name: string;

  @Column({ default: null })
  public bank_number: string;

  @Column({ default: null })
  public bank_branch: string;

  @Column({ default: null })
  public account_holder: string;

  @Column({ default: null })
  public withdraw_tips: string;

  @Column('float8', { default: 0 })
  public balance: number;

  @Column('float8', { default: 0 })
  public balance_frozen: number;

  @Column('float8', { default: 0 })
  public balance_avail: number;

  @Column('float8', { default: 0 })
  public balance_avail_newshare: number;

  @Column('float8', { default: 0 })
  public total_assets: number;

  @Column('float8', { default: 0 })
  public withdraw_avail: number;

  @Column('float8', { default: 0 })
  public profit: number;

  @Column('float8', { default: 0 })
  public sell_amount_day: number;

  @Column('float8', { default: 0 })
  public hold_value: number;

  @Column({ default: false })
  public is_freeze: boolean;

  @Column({ default: null })
  public online_service: string;

  @Column({ default: null })
  public agent: number;

  @Column({ default: null })
  public superior: string;

  @Column({ default: null })
  public last_login_ip: string;

  @Column({ default: false })
  ipo_application: boolean;

  @Column({ default: false })
  id_playing_board: boolean;

  @Column({ default: null })
  public created_by: string;

  @Column({ default: true })
  public is_active: boolean;

  @Column({ default: false })
  public is_delete: boolean;
}

export default AppUser;
