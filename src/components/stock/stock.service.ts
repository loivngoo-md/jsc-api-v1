import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import Stock from './entities/stock.entity';

@Injectable()
export class StockService {
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Stock)
    private _stockRepo: Repository<Stock>,
  ) {}

  async get_k_line_data(query: {
    fromtick: string;
    period: string;
    psize: string;
    symbol: string;
  }) {
    let { fromtick, period, psize, symbol } = query;

    psize = psize ?? '500';
    const APP_KEY = `AppCode ${process.env.APP_CODE_3RD}`;
    const uri = process.env.HOST_STOCK_3RD;
    const config = {
      headers: {
        Authorization: `${APP_KEY}`,
      },
    };
    const url = `${uri}/query/comkmv2ex?fromtick=${fromtick}&period=${period}&psize=${psize}&symbol=${symbol}`;
    const { data } = await firstValueFrom(this.httpService.get(url, config));
    const listStocks: string = data.Obj;

    const formattedStock = listStocks.split(';').map((string) => {
      const splittedData = string.split(',');
      return {
        Tick: Number(splittedData[0]),
        C: Number(splittedData[1]),
        O: Number(splittedData[2]),
        H: Number(splittedData[3]),
        L: Number(splittedData[4]),
        A: Number(splittedData[5]),
        V: Number(splittedData[6]),
      };
    });

    return formattedStock;
  }

  async create(createStockDto: CreateStockDto) {
    return 'This action adds a new stock';
  }

  async pullLatestStock(query: {
    page: number;
    limit: number;
    where?: string;
  }) {
    const ROUT = 'CNST';
    const { page, limit, where } = query;
    const APP_KEY = `AppCode ${process.env.APP_CODE_3RD}`;
    const uri = process.env.HOST_STOCK_3RD;
    const config = {
      headers: {
        Authorization: `${APP_KEY}`,
      },
    };

    for (let i = 1; i <= page; i++) {
      const url = `${uri}/query/compvol?p=${i}&ps=${limit}&rout=${ROUT}&sort=ZF&sorttype=0`;
      const { data } = await firstValueFrom(this.httpService.get(url, config));
      const listStocks: any[] = data.Obj;

      listStocks.map(async (stock) => {
        const newInsert = this._stockRepo.create(stock);
        await this._stockRepo.save(newInsert);
        return newInsert;
      });
    }
  }

  async findAll(query: any, user_app_id?: number) {
    const ROUT = 'CNST';
    const { page, limit, where } = query;
    const APP_KEY = `AppCode ${process.env.APP_CODE_3RD}`;
    const uri = process.env.HOST_STOCK_3RD;
    let url = `${uri}/query/compvol?p=${page}&ps=${limit}&rout=${ROUT}&sort=ZF&sorttype=0`;
    const config = {
      headers: {
        Authorization: `${APP_KEY}`,
      },
    };

    if (where) {
      url = url.concat(`&where=${where}`);
    }

    const { data } = await firstValueFrom(this.httpService.get(url, config));

    const listStocks: any[] = data.Obj;

    await this._stockRepo.upsert([...listStocks], ['FS']);

    if (user_app_id) {
      const FSs: string[] = listStocks.map((item: any) => item['FS']);

      const res = await this._stockRepo
        .createQueryBuilder('s')
        .leftJoinAndSelect(
          'favorite_stock',
          'fs',
          `s.FS = fs.fs and fs.user_id = ${user_app_id}`,
        )
        .select([
          's.*',
          'fs.*',
          's.created_at as created_at',
          's.updated_at as updated_at',
        ])
        .where('s.FS IN (:...ids)', { ids: FSs })
        .take(limit)
        .skip((page - 1) * limit)
        .getRawMany();

      return {
        count: FSs.length,
        data: res,
      };
    }

    return {
      count: listStocks.length,
      data: listStocks,
    };
  }

  async findOne(fs: string) {
    const ROUT = 'CNST';
    const APP_KEY = `AppCode ${process.env.APP_CODE_3RD}`;
    const uri = process.env.HOST_STOCK_3RD;
    let url = `${uri}/query/comrmsvol?symbols=${fs}&rout=${ROUT}&sort=ZF&sorttype=0`;
    const config = {
      headers: {
        Authorization: `${APP_KEY}`,
      },
    };

    const { data } = await firstValueFrom(this.httpService.get(url, config));
    const listStocks: any[] = data.Obj;

    if (listStocks) {
      await this._stockRepo.upsert([...listStocks], ['FS']);
      return listStocks[0];
    }

    throw new HttpException('Stock not found', HttpStatus.NOT_FOUND);
  }

  async update(id: string, updateStockDto: UpdateStockDto) {
    await this._stockRepo.update(id, updateStockDto);
    const updated = await this._stockRepo.findOne({ where: { FS: id } });
    if (updated) {
      return updated;
    }
    throw new HttpException('Stock not found', HttpStatus.NOT_FOUND);
  }

  remove(id: number) {
    return `This action removes a #${id} stock`;
  }

  toString(o) {
    Object.keys(o).forEach((k) => {
      if (typeof o[k] === 'object') {
        return this.toString(o[k]);
      }

      o[k] = '' + o[k];
    });

    return o;
  }

  async getStocksUsingCodes(codes: string[]) {
    return Promise.all(
      codes.map((code) =>
        this._stockRepo.findOne({
          where: {
            FS: code,
          },
        }),
      ),
    );
  }
}
