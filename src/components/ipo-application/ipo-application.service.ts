import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MESSAGE } from '../../common/constant';
import { IPO_APP_STATUS } from '../../common/enums';
import { AppUserService } from '../../modules/app-user/app-user.service';
import { IpoStockService } from '../ipo-stock/ipo-stock.service';
import {
  IpoAplicationCreate,
  IpoApplicationAssign,
} from './dto/create-ipo-application.dto';
import { UpdateIpoApplicationDto } from './dto/update-ipo-application.dto';
import { IpoApplication } from './entities/ipo-application.entity';

@Injectable()
export class IpoApplicationService {
  constructor(
    @InjectRepository(IpoApplication)
    private readonly _ipoAppRepo: Repository<IpoApplication>,
    private readonly _appUserService: AppUserService,
    private readonly _ipoStockService: IpoStockService,
  ) {}

  async assign(body: IpoApplicationAssign) {
    const { user_id, ipo_id, quantity } = body;
    const [userApp, ipoStock] = await Promise.all([
      this._appUserService.findOne(user_id),
      this._ipoStockService.findOne(ipo_id),
    ]);

    const { price } = ipoStock;
    const { balance_avail, balance_frozen } = userApp;
    const amount = price * quantity;

    if (amount > +balance_avail) {
      throw new BadRequestException(MESSAGE.NOT_ENOUGH_MONEY);
    }

    const ipoAppInfo = this._ipoAppRepo.create({
      user_id,
      ipo_id,
      price,
      quantity,
      amount,
    });
    await Promise.all([
      this._ipoAppRepo.save(ipoAppInfo),
      this._appUserService.updateBalance(user_id, {
        balance_avail: +balance_avail - amount,
        balance_frozen: +balance_frozen + amount,
      }),
    ]);
    return ipoAppInfo;
  }

  async create(body: IpoAplicationCreate) {
    const { username, ipo_code, quantity, actual_quantity, status } = body;

    const [userApp, ipoStock] = await Promise.all([
      this._appUserService.findByUsername(username),
      this._ipoStockService.findByCode(ipo_code),
    ]);

    const { price } = ipoStock;
    const amount = price * quantity;
    const actual_amount = price * (actual_quantity || 0);
    const { balance_avail, balance_frozen, balance } = userApp;

    const ipoAppInfo = {
      user_id: userApp.id,
      ipo_id: ipoStock.id,
      status,
      price,
      quantity,
      amount,
      actual_quantity: actual_quantity || 0,
      actual_amount,
    };

    const updateBalance = {
      balance_avail,
      balance,
      balance_frozen,
    };

    if (
      ![IPO_APP_STATUS.PENDING, IPO_APP_STATUS.FAIL].includes(status) &&
      !actual_quantity
    ) {
      throw new BadRequestException('Missing actual_quantity');
    }

    switch (status) {
      case IPO_APP_STATUS.PENDING:
        Object.assign(updateBalance, {
          balance_avail: +balance_avail - amount,
          balance_frozen: +balance_frozen + amount,
        });
        break;
      case IPO_APP_STATUS.SUCCESS:
        Object.assign(updateBalance, {
          balance_avail: +balance_avail - actual_amount,
          balance_frozen: +balance_frozen + actual_amount,
        });
        break;
      case IPO_APP_STATUS.PAID:
      case IPO_APP_STATUS.TRANFER:
        Object.assign(updateBalance, {
          balance_avail: +balance_avail - actual_amount,
          balance: +balance - actual_amount,
        });
    }

    await Promise.all([
      this._ipoAppRepo
    ])
  }

  findAll() {
    return `This action returns all ipoApplication`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ipoApplication`;
  }

  update(id: number, updateIpoApplicationDto: UpdateIpoApplicationDto) {
    return `This action updates a #${id} ipoApplication`;
  }

  remove(id: number) {
    return `This action removes a #${id} ipoApplication`;
  }
}
