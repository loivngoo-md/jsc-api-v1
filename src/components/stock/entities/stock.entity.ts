import { EntityHelper } from 'src/helpers/entity-helper';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'stocks' })
export class Stock extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ nullable: true })
  N: string;

  @Column({ nullable: true })
  M: string;

  @Column({ nullable: true })
  S: string;

  @Column({ nullable: true })
  C: string;

  @Column({ nullable: true, unique: true })
  FS: string;

  @Column('float8', { nullable: true })
  P: number;

  @Column('bigint', { nullable: true })
  NV: number;

  @Column('bigint', { nullable: true })
  Tick: number;

  @Column('float8', { nullable: true })
  B1: number;

  @Column('float8', { nullable: true })
  B2: number;

  @Column('float8', { nullable: true })
  B3: number;

  @Column('float8', { nullable: true })
  B4: number;

  @Column('float8', { nullable: true })
  B5: number;

  @Column('bigint', { nullable: true })
  B1V: number;

  @Column('bigint', { nullable: true })
  B2V: number;

  @Column('bigint', { nullable: true })
  B3V: number;

  @Column('bigint', { nullable: true })
  B4V: number;

  @Column('bigint', { nullable: true })
  B5V: number;

  @Column('float8', { nullable: true })
  S1: number;

  @Column('float8', { nullable: true })
  S2: number;

  @Column('float8', { nullable: true })
  S3: number;

  @Column('float8', { nullable: true })
  S4: number;

  @Column('float8', { nullable: true })
  S5: number;

  @Column('bigint', { nullable: true })
  S1V: number;

  @Column('bigint', { nullable: true })
  S2V: number;

  @Column('bigint', { nullable: true })
  S3V: number;

  @Column('bigint', { nullable: true })
  S4V: number;

  @Column('bigint', { nullable: true })
  S5V: number;

  @Column('float8', { nullable: true })
  ZT: number;

  @Column('float8', { nullable: true })
  DT: number;

  @Column('float8', { nullable: true })
  O: number;

  @Column('float8', { nullable: true })
  H: number;

  @Column('float8', { nullable: true })
  L: number;

  @Column('float8', { nullable: true })
  YC: number;

  @Column('bigint', { nullable: true })
  A: number;

  @Column('bigint', { nullable: true })
  V: number;

  @Column('bigint', { nullable: true })
  OV: number;

  @Column('bigint', { nullable: true })
  IV: number;

  @Column('float8', { nullable: true })
  SY: number;

  @Column('float8', { nullable: true })
  SJ: number;

  @Column('float8', { nullable: true })
  HS: number;

  @Column('float8', { nullable: true })
  ZS: number;

  @Column('float8', { nullable: true })
  LS: number;

  @Column('bigint', { nullable: true })
  Z: number;

  @Column('bigint', { nullable: true })
  Z2: number;

  @Column('float8', { nullable: true })
  VF: number;

  @Column('float8', { nullable: true })
  ZF: number;

  @Column('bigint', { nullable: true })
  JS: number;

  @Column('bigint', { nullable: true })
  YJS: number;

  @Column('bigint', { nullable: true })
  HD: number;

  @Column('bigint', { nullable: true })
  YHD: number;

  @Column('float8', { nullable: true })
  AVP: number;

  @Column('float8', { nullable: true })
  SY2: number;

  @Column('bigint', { nullable: true })
  QJ: number;

  @Column({ nullable: true })
  QR: string;

  @Column('bigint', { nullable: true })
  MT: number;
}

export default Stock;
