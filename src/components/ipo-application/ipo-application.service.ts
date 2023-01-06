import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MESSAGE } from '../../common/constant';
import { IPO_APP_STATUS, TRANSACTION_TYPE, TRX_TYPE } from '../../common/enums';
import { convertC2FS } from '../../helpers/stock-helper';
import { AppUserService } from '../../modules/app-user/app-user.service';
import { IpoStockService } from '../ipo-stock/ipo-stock.service';
import { StockStorageService } from '../stock-storage/stock-storage.service';
import { ITransactionsRate } from '../system-configuration/entities/system-configuration.interface';
import { TradingSessionService } from '../trading-session/trading-session.service';
import { TransactionsService } from './../transactions/transactions.service';
import {
  IpoAplicationCreate,
  IpoApplicationAssign,
} from './dto/create-ipo-application.dto';
import { IpoApplicationListQuery } from './dto/ipo-application-query.dto';
import { IpoApplicationUpdate } from './dto/update-ipo-application.dto';
import { IpoApplication } from './entities/ipo-application.entity';

@Injectable()
export class IpoApplicationService {
  constructor(
    @InjectRepository(IpoApplication)
    private readonly _ipoAppRepo: Repository<IpoApplication>,
    private readonly _appUserService: AppUserService,
    private readonly _ipoStockService: IpoStockService,
    private readonly _trxService: TransactionsService,
    private readonly _stockStorageService: StockStorageService,
    private readonly _tradingSessionService: TradingSessionService,
  ) {}

  async assign(body: IpoApplicationAssign) {
    const { user_id, ipo_id, quantity } = body;
    const [userApp, ipoStock] = await Promise.all([
      this._appUserService.findOne(user_id),
      this._ipoStockService.findOne(ipo_id),
    ]);

    const { price, supply_quantity, purchase_quantity } = ipoStock;
    const { balance_avail, balance_frozen } = userApp;
    const amount = price * quantity;

    if (supply_quantity - purchase_quantity < quantity) {
      throw new BadRequestException('Not enought quantity for purchase.');
    }

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
      this._ipoStockService.changePurchaseQuantity(
        ipo_id,
        +purchase_quantity + +quantity,
      ),
      this._appUserService.updateBalance(user_id, {
        balance_avail: +balance_avail - amount,
        balance_frozen: +balance_frozen + amount,
      }),
    ]);
    return ipoAppInfo;
  }

  async create(body: IpoAplicationCreate) {
    const { username, ipo_code, quantity, actual_quantity, status } = body;
    let transaction_fees = 0;
    let addPurchase = 0;

    if ([IPO_APP_STATUS.PAID, IPO_APP_STATUS.TRANFER].includes(status)) {
      return;
    }

    if (status === IPO_APP_STATUS.SUCCESS) {
      if (!actual_quantity) {
        throw new BadRequestException('Missing actual_quantity');
      }
      const session = await this._tradingSessionService.findOpeningSession();
      const rate = session.detail.transactions_rate as any as ITransactionsRate;
      transaction_fees = rate.transaction_fees;
    }

    const [appUser, ipoStock] = await Promise.all([
      this._appUserService.findByUsername(username),
      this._ipoStockService.findByCode(ipo_code),
    ]);

    const { price, supply_quantity, purchase_quantity } = ipoStock;
    const amount = price * quantity;
    const actual_amount =
      price * (actual_quantity || 0) * (1 + transaction_fees / 100);
    const { balance_avail, balance_frozen, balance } = appUser;

    const updateBalance = {
      balance,
      balance_frozen,
    };

    const ipoAppInfo = {
      user_id: appUser.id,
      ipo_id: ipoStock.id,
      status,
      price,
      quantity,
      amount,
      actual_quantity: actual_quantity || 0,
      actual_amount,
    };

    switch (status) {
      case IPO_APP_STATUS.PENDING:
        Object.assign(updateBalance, {
          balance_avail: +balance_avail - amount,
          balance_frozen: +balance_frozen + amount,
        });
        Object.assign(ipoAppInfo, {
          actual_amount: 0,
          actual_quantity: 0,
        });
        addPurchase = quantity;
        break;
      case IPO_APP_STATUS.FAIL:
        Object.assign(ipoAppInfo, {
          actual_amount: 0,
          actual_quantity: 0,
        });
        break;
      case IPO_APP_STATUS.SUCCESS:
        Object.assign(updateBalance, {
          balance_avail: +balance_avail - actual_amount,
          balance_frozen: +balance_frozen + actual_amount,
        });
        addPurchase = actual_quantity;
        break;
    }

    if (addPurchase && addPurchase + purchase_quantity > supply_quantity) {
      throw new BadRequestException('Not enought quantity for purchase.');
    }

    const trx = this._ipoAppRepo.create(ipoAppInfo);

    await Promise.all([
      this._ipoAppRepo.save(trx),
      this._ipoStockService.changePurchaseQuantity(
        ipoStock.id,
        +purchase_quantity + addPurchase,
      ),
      this._appUserService.updateBalance(appUser.id, updateBalance),
    ]);

    return trx;
  }

  async paidByApp(ipo_app_id: number, app_user_id: number) {
    const [ipoApp, appUser] = await Promise.all([
      this.findOne(ipo_app_id),
      this._appUserService.findOne(app_user_id),
    ]);

    ipoApp.status = IPO_APP_STATUS.PAID;
    const { actual_amount } = ipoApp;
    const { balance, balance_frozen } = appUser;
    const trxInfo = {
      trx_id: ipoApp.id,
      type: TRANSACTION_TYPE.BUY_IPO,
      user_id: app_user_id,
      before: balance,
      after: balance - actual_amount,
    };

    await Promise.all([
      this._ipoAppRepo.save(ipoApp),
      this._trxService.addTrx(trxInfo),
      this._appUserService.updateBalance(app_user_id, {
        balance: balance - actual_amount,
        balance_frozen: balance_frozen - actual_amount,
      }),
    ]);
  }

  async reviewByCms(ipo_app_id: number, body: any, isSuccess: boolean) {
    const { actual_quantity } = body;

    const ipoApp = await this.findOne(ipo_app_id);
    if (actual_quantity > ipoApp.quantity) {
      throw new BadRequestException(
        `Purchase must be small than ${ipoApp.amount}`,
      );
    }

    const [appUser, ipoStock] = await Promise.all([
      this._appUserService.findOne(ipoApp.user_id),
      this._ipoStockService.findOne(ipoApp.ipo_id),
    ]);

    const { quantity, amount, price } = ipoApp;
    const { purchase_quantity } = ipoStock;
    const { balance_avail, balance_frozen } = appUser;

    let act_amount = 0;
    let act_quantity = 0;
    if (isSuccess) {
      const session = await this._tradingSessionService.findOpeningSession();
      const { transaction_fees } = session.detail
        .transactions_rate as any as ITransactionsRate;

      act_quantity = actual_quantity;
      act_amount = price * actual_quantity * (1 + transaction_fees / 100);

      //Update ipo-application
      ipoApp.status = IPO_APP_STATUS.SUCCESS;
      ipoApp.actual_quantity = act_quantity;
      ipoApp.actual_amount = act_amount;
    } else {
      ipoApp.status = IPO_APP_STATUS.FAIL;
    }
    await Promise.all([
      this._ipoAppRepo.save(ipoApp),
      //Update ipo-stock
      this._ipoStockService.changePurchaseQuantity(
        ipoApp.ipo_id,
        +purchase_quantity - quantity + +act_quantity,
      ),
      //Update balance of user
      this._appUserService.updateBalance(ipoApp.user_id, {
        balance_avail: balance_avail + amount - act_amount,
        balance_frozen: balance_frozen - amount + act_amount,
      }),
    ]);

    return { isSuccess: true };
  }

  async transferByCms(ipo_app_id: number) {
    const ipoApp = await this.findOne(ipo_app_id);
    if (ipoApp.status !== IPO_APP_STATUS.PAID) {
      throw new BadRequestException('IPO Application is not Paid.');
    }

    const [ipoStock, session] = await Promise.all([
      this._ipoStockService.findOne(ipoApp.ipo_id),
      this._tradingSessionService.findOpeningSession(),
    ]);

    const { actual_amount, actual_quantity, price, user_id } = ipoApp;
    const { code } = ipoStock;

    ipoApp.status = IPO_APP_STATUS.TRANFER;

    await Promise.all([
      this._ipoAppRepo.save(ipoApp),
      this._stockStorageService.store({
        stock_code: convertC2FS(code),
        amount: actual_amount,
        user_id,
        quantity: actual_quantity,
        trading_session: session.id,
        price,
        type: TRX_TYPE.IPO,
      }),
    ]);

    return { isSuccess: true };
  }

  async findOne(ipo_app_id: number) {
    const ipoApp = await this._ipoAppRepo.findOne({
      where: { id: ipo_app_id, is_delete: false },
    });

    if (!ipoApp) {
      throw new NotFoundException(MESSAGE.notFoundError('Ipo Application'));
    }

    return ipoApp;
  }

  async findAll(query: IpoApplicationListQuery) {
    const { page, pageSize, key_words } = query;

    const take = +pageSize || 10;
    const skip = +pageSize * (+page - 1) || 0;

    const queryBuilder = this._ipoAppRepo
      .createQueryBuilder('ia')
      .innerJoinAndSelect('ipo-stock', 'is', 'is.id = ia.ipo_id')
      .innerJoinAndSelect('app_users', 'u', 'u.id = ia.user_id')
      .select([
        'bt.*',
        'row_to_json(u.*) as user_detail',
        'row_to_json(is.*) as ipo_stock',
      ])
      .where(`bt.is_delete = false`);

    key_words &&
      queryBuilder.andWhere(
        `is.code LIKE '%${key_words}%' 
        OR is.name LIKE '%${key_words}%'
        OR u.username LIKE '%${key_words}%'
        OR u.phone LIKE '%${key_words}%'`,
      );

    const total = await queryBuilder.clone().getCount();
    const recs = await queryBuilder.limit(take).offset(skip).getRawMany();

    return {
      count: recs.length,
      data: recs,
      total,
    };
  }

  async update(ipo_app_id: number, body: IpoApplicationUpdate) {
    const ipoApp = await this.findOne(ipo_app_id);
    if (ipoApp.status !== IPO_APP_STATUS.PENDING) {
      throw new BadRequestException('Ipo App is NOT PENDING.');
    }
    const [appUser, ipoStock] = await Promise.all([
      this._appUserService.findOne(ipoApp.user_id),
      this._ipoStockService.findOne(ipoApp.ipo_id),
    ]);
    const { ipo_code, amount } = body;
    
  }

  remove(id: number) {
    return `This action removes a #${id} ipoApplication`;
  }
}
