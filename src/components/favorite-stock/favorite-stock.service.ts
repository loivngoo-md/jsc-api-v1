import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StockService } from 'src/components/stock/stock.service';
import { Repository } from 'typeorm';
import { MESSAGE } from '../../common/constant';
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
      .limit(pageSize)
      .offset((page - 1) * pageSize)
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
      throw new BadRequestException(MESSAGE.BAD_REQUEST);
    }
    const infoRec = this._repo.create({ user_id, fs });
    return await this._repo.save(infoRec);
  };

  public remove = async (user_id: number, fs: string) => {
    const existRec = await this._repo.findOne({ where: { user_id, fs } });
    if (!existRec) {
      throw new BadRequestException(MESSAGE.BAD_REQUEST);
    }
    await this._repo.remove(existRec);
    return { isSuccess: true };
  };
}
