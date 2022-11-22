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

    @Column({default: true})
    audit: boolean

    @Column({nullable: true})
    before: string

    @Column({default: false})
    isApproved: boolean

    @Column({nullable: true})
    after: string

    @Column({default: null})
    comments: string

    @Column({default: null})
    remark: string

    @Column({default: null})
    reviewed_by: string

    @Column({default: null})
    reviewed_at: Date

    @Column()
    created_at: Date;
}
