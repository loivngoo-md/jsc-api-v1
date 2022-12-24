import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NOT_FOUND } from 'src/common/constant/error-message';
import { StockService } from 'src/components/stock/stock.service';
import { Repository } from 'typeorm';
import { QueryFavorite } from './dto/query-favorite.dto';
import { FavoriteStock } from './entities/favorite-stock.entity';

@Injectable()
export class FavoriteStockService {
  constructor(
    @InjectRepository(FavoriteStock)
    private readonly _repo: Repository<FavoriteStock>,
    private readonly _stockService: StockService,
  ) {}

  public get_list = async (query: QueryFavorite) => {
    const page = query['page'] || 1;
    const pageSize = query['pageSize'] || 10;

    delete query['page'];
    delete query['pageSize'];

    const rec = await this._repo
      .createQueryBuilder('fs')
      .innerJoinAndSelect('stocks', 's', 's.FS = fs.fs')
      .select([
        'fs.*',
        's.*',
        'fs.created_at as created_at',
        'fs.updated_at as updated_at',
      ])
      .where(query)
      .take(pageSize)
      .skip((page - 1) * pageSize)
      .getRawMany();

    return {
      count: rec.length,
      data: rec,
    };
  };

  public get_list_by_user = async (user_id: number) => {
    return await this._repo.findOne({
      where: {
        user_id,
      },
    });
  };

  public create = async (user_id: number, fs: string) => {
    await this._stockService.findOne(fs);
    const existRec = await this._repo.findOne({ where: { user_id, fs } });
    if (existRec) {
      throw new Error('Exist favorite stock');
    }
    const infoRec = this._repo.create({ user_id, fs });
    return await this._repo.save(infoRec);
  };

  public remove = async (user_id: number, fs: string) => {
    const existRec = await this._repo.findOne({ where: { user_id, fs } });
    if (!existRec) {
      throw new NotFoundException(NOT_FOUND);
    }
    await this._repo.remove(existRec);
    return { isSuccess: true };
  };

  // public insert = async (fs: any) => {
  //   const el = this._repo.create(fs)
  //   await this._repo.save(el)
  //   return el
  // }

  // view = async (id: number) => await this._repo.findOneByOrFail({ id })

  // upsert = async (id: number, el: []) => {
  //   return await this._repo.upsert([...el], [`id`])
  // }

  // update = async (id: number, el: {}) => {
  //   let fs = await this._repo.findOneByOrFail({ id })
  //   if (!!fs) {
  //     const e = await this._repo.update({ id }, { ...el })
  //     return e.raw
  //   }
  //   throw new NotFoundException(NOT_FOUND)
  // }

  // updateOrFail = async (id: number, el: {}) => {
  //   let fs = await this._repo.findOneByOrFail({ id })
  //   if (!!fs) {
  //     const e = await this._repo.update({ id }, { ...el })
  //     return e.raw
  //   }
  //   throw new NotFoundException(NOT_FOUND)
  // }

  // removeOrFail = async (id: number) => {
  //   let fs = await this._repo.findOneByOrFail({ id })
  //   if (!!fs) {
  //     const e = await this._repo.delete({ id })
  //     return e.raw
  //   }
  //   throw new NotFoundException(NOT_FOUND)
  // }
}
