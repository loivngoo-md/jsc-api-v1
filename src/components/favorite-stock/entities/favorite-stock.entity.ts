import { EntityHelper } from '../../../helpers/entity-helper';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({name: "favorite_stock"})
export class FavoriteStock extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('bigint')
  user_id: number;

  @Column()
  fs: string;
}
