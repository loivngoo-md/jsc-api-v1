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
  is_approved: boolean;

  @Column("varchar", { default: "" })
  comments: string;

  @Column("varchar", { default: "" })
  remark: string;

  @Column("varchar", { default: "" })
  reviewed_by: string;

  @Column({ nullable: true })
  reviewed_at: Date;

}
