import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { EntityHelper } from 'src/helpers/entity-helper';


@Entity({ name: 'app_users' })
class AppUser extends EntityHelper {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ nullable: false })
  public username: string;

  // @Exclude()
  @Column({ nullable: false })
  public password: string;

  @Column({ nullable: true })
  public withdraw_password: string;

  @Column({ default: false })
  public is_real: boolean;

  @Column({ default: false })
  public is_verified: boolean;

  @Column({ default: null })
  public real_name: string;

  @Column({ default: null })
  public id_number_cccd: string;

  @Column({ default: null })
  public id_front_cccd: string;

  @Column({ default: null })
  public id_back_cccd: string;

  @Column({ default: null })
  public phone: string;

  @Column({ default: null })
  public bank_name: string;

  @Column({ default: null })
  public bank_number: string;

  @Column({ default: null })
  public bank_branch: string;

  @Column({ default: null })
  public account_name: string;

  @Column({ default: null })
  public withdraw_tips: string;

  @Column({ default: null })
  public balance: string

  @Column({ default: null })
  public balance_frozen: string;

  @Column({ default: null })
  public balance_avail: string;

  @Column({ default: null })
  public balance_avail_newshare: string

  @Column({ default: null })
  public total_assets: string;

  @Column({ default: null })
  public withdraw_avail: string

  @Column({ default: null })
  public profit: string;

  @Column({ default: null })
  public sell_amount_day: string;

  @Column({ default: null })
  public hold_value: number;


  @Column({ default: null })
  public online_service: string;

  @Column({ default: null })
  public agent_code: string;

  @Column({ default: null })
  public superior: string;

  @Column({ default: null })
  public last_login_ip: string;

  @Column({ default: false })
  ipo_application: boolean

  @Column({ default: false })
  id_playing_board: boolean

  @Column({ default: null })
  public created_by: string;

  @Column({ default: true })
  public is_active: boolean

  @Column({ default: null })
  public created_at: Date

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