import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'money_log' })
class MoneyLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @Column()
    amount: string;

    @Column()
    before: string;

    @Column()
    after: string;

    @Column()
    type: string;

    @Column({ default: null })
    comments: string;

    @Column({ default: null })
    remark: string;
}

export default MoneyLog;