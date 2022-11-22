import { EntityHelper } from 'src/helpers/entity-helper';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'deposit' })
class Deposit extends EntityHelper {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string

    @Column()
    amount: number

    @Column()
    deposit_account_id: number

    @Column()
    audit: boolean

    @Column()
    isVirtualDeposit: boolean

    @Column()
    comments: string

    @Column()
    remark: string


    @Column()
    created_at: Date;
}

export default Deposit;