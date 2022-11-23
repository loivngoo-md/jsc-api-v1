import { EntityHelper } from "src/helpers/entity-helper";
import { Column, PrimaryGeneratedColumn } from "typeorm";

export class Order extends EntityHelper {
    @PrimaryGeneratedColumn()
    id: number

    @Column("integer")
    quantity: number

    @Column("varchar")
    stock_code: string

    @Column("float8")
    amount: number

    @Column("integer")
    user_id: number

    @Column({ nullable: true })
    is_resolved: boolean
}
