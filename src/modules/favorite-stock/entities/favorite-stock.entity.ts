import { EntityHelper } from "../../../helpers/entity-helper";
import { Column, PrimaryGeneratedColumn } from "typeorm";

export class FavoriteStock extends EntityHelper {

    @PrimaryGeneratedColumn()
    id: number

    @Column("bigint")
    user_id: number

    @Column()
    fs: string

}
