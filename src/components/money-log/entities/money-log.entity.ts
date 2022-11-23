import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'money_log' })
class MoneyLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("integer")
  user_id: number;

  @Column("float8")
  amount: number;

  @Column("float8")
  before: number;

  @Column("float8")
  after: number;

  @Column("varchar")
  type: string;

  @Column({ default: "" })
  comments: string;

  @Column({ default: "" })
  remark: string;
}

export default MoneyLog;
