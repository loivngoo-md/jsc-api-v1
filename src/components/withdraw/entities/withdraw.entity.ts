import { EntityHelper } from 'src/helpers/entity-helper';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'withdraw' })
export class Withdraw extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar")
  username: string;

  @Column("float8")
  amount: number;

  @Column("float8", { default: 0 })
  before: number;

  @Column("float8", { default: 0 })
  after: number;

  @Column("bool", { default: false })
  isApproved: boolean;

  @Column("varchar", { default: "" })
  comments: string;

  @Column("varchar", { default: "" })
  remark: string;

  @Column("varchar", { default: "" })
  reviewed_by: string;

  @Column({ default: new Date() })
  reviewed_at: Date;

  @Column({ default: new Date() })
  created_at: Date;
}
