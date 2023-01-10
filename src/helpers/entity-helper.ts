import { AfterLoad, BaseEntity, BeforeUpdate, Column } from 'typeorm';

export class EntityHelper extends BaseEntity {
  __entity?: string;

  @AfterLoad()
  setEntityName() {
    this.__entity = this.constructor.name;
  }

  @Column({ type: 'bigint', default: new Date().getTime() })
  created_at: number;

  @Column({
    type: 'bigint',
    default: new Date().getTime(),
  })
  updated_at: number;

  @BeforeUpdate()
  setUpdatedDate() {
    this.updated_at = new Date().getTime();
  }
}
