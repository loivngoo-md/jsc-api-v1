import { EntityHelper } from 'src/helpers/entity-helper';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'transactions' })
class Transaction extends EntityHelper {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number

    @Column()
    type: string

    @Column()
    amount: string

    @Column()
    before: string

    @Column()
    after: string

    @Column({ default: true })
    audit: Boolean

    @Column()
    quantity: number

    @Column()
    remarks: string

    @Column()
    deposit_account_id: number

    @Column()
    created_at: Date

}

export default Transaction;