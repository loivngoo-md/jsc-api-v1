import { AfterLoad, BaseEntity, Column } from 'typeorm';

export class EntityHelper extends BaseEntity {
  __entity?: string;

  @AfterLoad()
  setEntityName() {
    this.__entity = this.constructor.name;
  }

  @Column({ default: new Date() })
  created_at: Date
}
