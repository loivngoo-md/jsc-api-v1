import { EntityHelper } from 'src/helpers/entity-helper';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'withdraw' })
export class Withdraw extends EntityHelper {
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
    comments: string

    @Column()
    remark: string

    @Column()
    reviewed_by: string

    @Column()
    reviewed_at: Date

    @Column()
    created_at: Date;
}
