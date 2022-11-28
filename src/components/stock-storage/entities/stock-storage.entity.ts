import { EntityHelper } from "src/helpers/entity-helper";
import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "stock-storage" })
export class StockStorage extends EntityHelper {
    @PrimaryGeneratedColumn()
    id: number

    @Column("bigint")
    user_id: number

    @Column("varchar")
    stock_code: string

    @Column("bigint")
    quantity: number

    @Column("float8")
    price: number

    @Column("float8")
    amount: number
}