import { AfterLoad, BaseEntity, BeforeInsert, BeforeUpdate, Column } from 'typeorm';

export class EntityHelper extends BaseEntity {
  __entity?: string;

  @AfterLoad()
  setEntityName() {
    this.__entity = this.constructor.name;
  }

  @Column({ default: new Date() })
  created_at: Date

  @Column({ default: new Date() })
  updated_at: Date

  @BeforeInsert()
  @BeforeUpdate()
  async set_updated_at() {
    this.updated_at = new Date()
  }
}
