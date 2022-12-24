import {
  AfterLoad,
  BaseEntity,
  Column,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';

export class EntityHelper extends BaseEntity {
  __entity?: string;

  @AfterLoad()
  setEntityName() {
    this.__entity = this.constructor.name;
  }

  @Column('timestamptz', { default: new Date() })
  created_at: Timestamp;

  @UpdateDateColumn({ type: 'timestamptz', default: new Date() })
  updated_at: Timestamp;
}
