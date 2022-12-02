import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import Stock from './entities/stock.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class StockService {
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Stock)
    private _stockRepo: Repository<Stock>,
  ) { }


  async get_k_line_data(query: {
    fromtick: string,
    period: string,
    psize: string,
    symbol: string
  }) {
    let { fromtick, period, psize, symbol } = query

    psize = psize ?? '500'
    const APP_KEY = `AppCode ${process.env.APP_CODE_3RD}`;
    const uri = process.env.HOST_STOCK_3RD;
    const config = {
      headers: {
        Authorization: `${APP_KEY}`,
      },
    };
    const url = `${uri}/query/comkmv2ex?fromtick=${fromtick}&period=${period}&psize=${psize}&symbol=${symbol}`
    const { data } = await firstValueFrom(this.httpService.get(url, config));
    const listStocks: string = data.Obj;

    const formattedStock = listStocks.split(';').map(string => {
      const splittedData = string.split(',')
      return {
        Tick: Number(splittedData[0]),
        C: Number(splittedData[1]),
        O: Number(splittedData[2]),
        H: Number(splittedData[3]),
        L: Number(splittedData[4]),
        A: Number(splittedData[5]),
        V: Number(splittedData[6]),
      }
    })

    return formattedStock
  }

  async create(createStockDto: CreateStockDto) {
    return 'This action adds a new stock';
  }

  async pullLatestStock(query: { page: number; ps: number; where?: string }) {
    const ROUT = 'CNST';
    const { page, ps, where } = query;
    const APP_KEY = `AppCode ${process.env.APP_CODE_3RD}`;
    const uri = process.env.HOST_STOCK_3RD;
    const config = {
      headers: {
        Authorization: `${APP_KEY}`,
      },
    };

    for (let i = 1; i <= page; i++) {
      const url = `${uri}/query/compvol?p=${i}&ps=${ps}&rout=${ROUT}&sort=ZF&sorttype=0`;
      const { data } = await firstValueFrom(this.httpService.get(url, config));
      const listStocks: any[] = data.Obj;

      listStocks.map(async (stock) => {
        const newInsert = this._stockRepo.create(stock);
        await this._stockRepo.save(newInsert);
        return newInsert;
      });
    }
  }

  async findAll(query) {
    const ROUT = 'CNST';
    const { page, ps, where } = query;
    const APP_KEY = `AppCode ${process.env.APP_CODE_3RD}`;
    const uri = process.env.HOST_STOCK_3RD;
    let url = `${uri}/query/compvol?p=${page}&ps=${ps}&rout=${ROUT}&sort=ZF&sorttype=0`;
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

    await this._stockRepo.upsert([...listStocks], ['id'])
    return {
      count: listStocks.length,
      data: listStocks,
    };
  }

  async findOne(fs: string) {
    const stock = await this._stockRepo.findOne({ where: { FS: fs } });
    if (stock) {
      delete stock['__entity'];
      delete stock['id']
      await this._stockRepo.update({ FS: stock.FS }, stock);
      return stock;
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

  async getStocksUsingCodes (codes: string[]) {
    return Promise.all(codes.map((code) => this._stockRepo.findOne({
      where: {
        FS: code
      }
    })))
  }
}
