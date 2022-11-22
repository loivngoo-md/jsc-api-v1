

import { EntityHelper } from 'src/helpers/entity-helper';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'deposit_accounts' })
class DepositAccount extends EntityHelper {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    bank_name: string

    @Column()
    bank_branch: string

    @Column()
    bank_card: string

    @Column({ default: true })
    isPublic: boolean

    @Column({ default: true })
    isEnable: boolean

    @Column()
    created_at: Date

}

export default DepositAccount