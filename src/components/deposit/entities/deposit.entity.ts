import { EntityHelper } from 'src/helpers/entity-helper';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'deposit' })
class Deposit extends EntityHelper {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string

    @Column({ nullable: false })
    amount: string

    @Column({ nullable: false })
    deposit_account_id: number

    @Column({ default: false })
    is_reviewed: boolean

    @Column({ default: false })
    is_virtual_deposit: boolean

    @Column({ default: null })
    comments: string

    @Column({ default: null })
    remark: string

    @Column()
    created_at: Date;
}

export default Deposit;