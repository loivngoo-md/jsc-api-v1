import { EntityHelper } from "src/helpers/entity-helper";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "system_configuration" })
export class SystemConfiguration extends EntityHelper {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    transaction_fee: number

    @Column()
    withdrawal_fee: number

    @Column()
    minimum_transaction_balance: number

    @Column({ default: false })
    is_main_config: boolean
}