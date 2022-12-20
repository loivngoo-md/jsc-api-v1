import {
  AfterLoad,
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';
import * as moment from 'moment';

export class EntityHelper extends BaseEntity {
  __entity?: string;

  @AfterLoad()
  setEntityName() {
    this.__entity = this.constructor.name;
  }

  @Column('timestamptz', {
    default: new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }),
  })
  created_at: Timestamp;

  @UpdateDateColumn({
    default: new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }),
  })
  updated_at: Timestamp;
}
