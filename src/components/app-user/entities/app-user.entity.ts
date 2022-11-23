import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { EntityHelper } from 'src/helpers/entity-helper';
import Decimal from 'decimal.js';

@Entity({ name: 'app_users' })
class AppUser extends EntityHelper {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ nullable: false })
  public username: string;

  @Column({ nullable: false })
  public password: string;

  @Column({ default: "" })
  public withdraw_password: string;

  @Column({ default: false })
  public is_real: boolean;

  @Column({ default: false })
  public is_verified: boolean;

  @Column({ default: "" })
  public real_name: string;

  @Column({ default: "" })
  public id_number_cccd: string;

  @Column({ default: "" })
  public id_front_cccd: string;

  @Column({ default: "" })
  public id_back_cccd: string;

  @Column({ default: "" })
  public phone: string;

  @Column({ default: "" })
  public bank_name: string;

  @Column({ default: "" })
  public bank_number: string;

  @Column({ default: "" })
  public bank_branch: string;

  @Column({ default: "" })
  public account_name: string;

  @Column({ default: "" })
  public withdraw_tips: string;

  @Column("float8", { default: 0 })
  public balance: number;

  @Column("float8", { default: 0 })
  public balance_frozen: number;

  @Column("float8", { default: 0 })
  public balance_avail: number;

  @Column("float8", { default: 0, })
  public balance_avail_newshare: number;

  @Column("float8", { default: 0 })
  public total_assets: number;

  @Column("float8", { default: 0 })
  public withdraw_avail: number;

  @Column("float8", { default: 0 })
  public profit: number;

  @Column("float8", { default: 0 })
  public sell_amount_day: number;

  @Column("float8", { default: 0 })
  public hold_value: number;

  @Column({ default: false })
  public is_freeze: boolean;

  @Column({ default: "" })
  public online_service: string;

  @Column({ default: "" })
  public agent_code: string;

  @Column({ default: "" })
  public superior: string;

  @Column({ default: "" })
  public last_login_ip: string;

  @Column({ default: false })
  ipo_application: boolean;

  @Column({ default: false })
  id_playing_board: boolean;

  @Column({ default: "" })
  public created_by: string;

  @Column({ default: true })
  public is_active: boolean;

  @Column({ default: new Date() })
  public created_at: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async setPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
    }
  }
}

export default AppUser;
