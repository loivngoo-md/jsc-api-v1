import { EntityHelper } from 'src/helpers/entity-helper';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';



@Entity({ name: 'stocks' })
export class Stock extends EntityHelper {
    @PrimaryGeneratedColumn()
    id: string;

    @Column({ nullable: true })
    N: string

    @Column({ nullable: true })
    M: string

    @Column({ nullable: true })
    S: string

    @Column({ nullable: true })
    C: string

    @Column({ nullable: true })
    FS: string

    @Column({ nullable: true })
    P: string

    @Column({ nullable: true })
    NV: string

    @Column({ nullable: true })
    Tick: string

    @Column({ nullable: true })
    B1: string

    @Column({ nullable: true })
    B2: string

    @Column({ nullable: true })
    B3: string

    @Column({ nullable: true })
    B4: string

    @Column({ nullable: true })
    B5: string

    @Column({ nullable: true })
    B1V: string

    @Column({ nullable: true })
    B2V: string

    @Column({ nullable: true })
    B3V: string

    @Column({ nullable: true })
    B4V: string

    @Column({ nullable: true })
    B5V: string

    @Column({ nullable: true })
    S1: string

    @Column({ nullable: true })
    S2: string

    @Column({ nullable: true })
    S3: string

    @Column({ nullable: true })
    S4: string

    @Column({ nullable: true })
    S5: string

    @Column({ nullable: true })
    S1V: string

    @Column({ nullable: true })
    S2V: string

    @Column({ nullable: true })
    S3V: string

    @Column({ nullable: true })
    S4V: string

    @Column({ nullable: true })
    S5V: string

    @Column({ nullable: true })
    ZT: string

    @Column({ nullable: true })
    DT: string

    @Column({ nullable: true })
    O: string

    @Column({ nullable: true })
    H: string

    @Column({ nullable: true })
    L: string

    @Column({ nullable: true })
    YC: string 

    @Column({ nullable: true })
    A: string

    @Column({ nullable: true })
    V: string

    @Column({ nullable: true })
    OV: string

    @Column({ nullable: true })
    IV: string

    @Column({ nullable: true })
    SY: string

    @Column({ nullable: true })
    SJ: string

    @Column({ nullable: true })
    HS: string

    @Column({ nullable: true })
    ZS: string

    @Column({ nullable: true })
    LS: string

    @Column({ nullable: true })
    Z: string

    @Column({ nullable: true })
    Z2: string

    @Column({ nullable: true })
    VF: string

    @Column({ nullable: true })
    ZF: string

    @Column({ nullable: true })
    JS: string

    @Column({ nullable: true })
    YJS: string

    @Column({ nullable: true })
    HD: string

    @Column({ nullable: true })
    YHD: string

    @Column({ nullable: true })
    AVP: string

    @Column({ nullable: true })
    SY2: string

    @Column({ nullable: true })
    QJ: string

    @Column({ nullable: true })
    QR: string

    @Column({ nullable: true })
    MT: string

}

export default Stock;