import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MESSAGE } from '../../common/constant';
import {
  IPO_APP_QUANTITY_INCREASE,
  IPO_APP_STATUS_NOT_PENDING,
  IPO_APP_STATUS_PAID,
  IPO_APP_WRONG_STATUS,
  IPO_STOCK_MISSING_ACT_QUANTITY,
  IPO_STOCK_NOT_ON_MARKET,
  IPO_STOCK_QUANTITY,
} from '../../common/constant/error-message';
import { IPO_APP_STATUS, TRANSACTION_TYPE, TRX_TYPE } from '../../common/enums';
import { convertC2FS } from '../../helpers/stock-helper';
import { AppUserService } from '../../modules/app-user/app-user.service';
import { IpoStockService } from '../ipo-stock/ipo-stock.service';
import { StockStorageService } from '../stock-storage/stock-storage.service';
import { ITransactionsRate } from '../system-configuration/entities/system-configuration.interface';
import { TradingSessionService } from '../trading-session/trading-session.service';
import { TransactionsService } from './../transactions/transactions.service';
import {
  IpoApplicationAssign,
  IpoApplicationCreate,
} from './dto/create-ipo-application.dto';
import { IpoApplicationListQuery } from './dto/ipo-application-query.dto';
import {
  IpoApplicationReview,
  IpoApplicationUpdate,
} from './dto/update-ipo-application.dto';
import { IpoApplication } from './entities/ipo-application.entity';

@Injectable()
export class IpoApplicationService {
  constructor(
    @InjectRepository(IpoApplication)
    private readonly _ipoAppRepo: Repository<IpoApplication>,
    private readonly _appUserService: AppUserService,
    private readonly _ipoStockService: IpoStockService,
    private readonly _trxService: TransactionsService,
    private readonly _tradingSessionService: TradingSessionService,
    private readonly _stockStorageService: StockStorageService,
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
      throw new BadRequestException(IPO_STOCK_QUANTITY);
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

  async create(body: IpoApplicationCreate) {
    const { username, ipo_code, quantity, actual_quantity, status } = body;
    let transaction_fees = 0;
    let addPurchase = 0;

    if ([IPO_APP_STATUS.PAID, IPO_APP_STATUS.TRANFER].includes(status)) {
      return;
    }

    if (status === IPO_APP_STATUS.SUCCESS) {
      if (!actual_quantity) {
        throw new BadRequestException(IPO_STOCK_MISSING_ACT_QUANTITY);
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
      throw new BadRequestException(IPO_STOCK_QUANTITY);
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

  async reviewByCms(ipo_app_id: number, body: IpoApplicationReview) {
    const { actual_quantity, is_accept } = body;

    const ipoApp = await this.findOne(ipo_app_id);

    if (is_accept && !actual_quantity) {
      throw new BadRequestException(IPO_STOCK_MISSING_ACT_QUANTITY);
    }

    if (is_accept && actual_quantity > ipoApp.quantity) {
      throw new BadRequestException(`购买不能大于${ipoApp.quantity}`);
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
    if (is_accept) {
      const session = await this._tradingSessionService.findToday();
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
      throw new BadRequestException(IPO_APP_STATUS_PAID);
    }

    const [ipoStock, session] = await Promise.all([
      this._ipoStockService.findOne(ipoApp.ipo_id),
      this._tradingSessionService.findToday(),
    ]);

    if (!ipoStock.is_on_market) {
      throw new BadRequestException(IPO_STOCK_NOT_ON_MARKET);
    }

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
      throw new NotFoundException(MESSAGE.notFoundError('上市申请'));
    }

    return ipoApp;
  }

  async findAll(query: IpoApplicationListQuery, user_app_id?: number) {
    const { page, pageSize, code, name, username, phone, status } = query;
    console.log(query);
    const take = +pageSize || 10;
    const skip = +pageSize * (+page - 1) || 0;

    const queryBuilder = this._ipoAppRepo
      .createQueryBuilder('ia')
      .innerJoin('ipo-stock', 'ist', 'ist.id = ia.ipo_id')
      .innerJoin('app_users', 'u', 'u.id = ia.user_id')
      .innerJoin('agent', 'ag', 'ag.id = u.agent')
      .select([
        'ia.*',
        'row_to_json(u.*) as user_detail',
        'row_to_json(ist.*) as ipo_stock',
        'row_to_json(ag.*) as agent_detail',
      ])
      .where(`ia.is_delete = false`);

    code && queryBuilder.andWhere(`ist.code ILIKE '%${code}%'`);
    name && queryBuilder.andWhere(`ist.name ILIKE '%${name}%'`);
    !user_app_id &&
      username &&
      queryBuilder.andWhere(`u.username ILIKE '%${username}%'`);
    user_app_id && queryBuilder.andWhere(`u.id = ${user_app_id}`);
    phone && queryBuilder.andWhere(`u.phone ILIKE '%${phone}%'`);
    if (status) {
      typeof status === 'string' &&
        queryBuilder.andWhere(`ia.status = '%${status}%'`);
      typeof status === 'object' &&
        queryBuilder.andWhere('ia.status IN (:...status)', {
          status,
        });
    }

    const total = await queryBuilder.clone().getCount();
    const recs = await queryBuilder
      .limit(take)
      .offset(skip)
      .orderBy('ia.created_at', 'DESC')
      .getRawMany();

    return {
      count: recs.length,
      data: recs,
      total,
    };
  }

  async update(ipo_app_id: number, body: IpoApplicationUpdate) {
    const ipoApp = await this.findOne(ipo_app_id);
    if (ipoApp.status !== IPO_APP_STATUS.PENDING) {
      throw new BadRequestException(IPO_APP_STATUS_NOT_PENDING);
    }
    const [appUser, ipoStock] = await Promise.all([
      this._appUserService.findOne(ipoApp.user_id),
      this._ipoStockService.findOne(ipoApp.ipo_id),
    ]);
    const { quantity } = body;
    const { balance_avail, balance_frozen } = appUser;
    const { supply_quantity, purchase_quantity } = ipoStock;
    const remainQuantity = supply_quantity - purchase_quantity;
    const addQuantity = quantity - ipoApp.quantity;
    const addAmount = addQuantity * ipoApp.price;
    if (addQuantity > 0 && addQuantity > remainQuantity) {
      throw new BadRequestException(IPO_APP_QUANTITY_INCREASE);
    }

    ipoApp.quantity = +ipoApp.quantity + addQuantity;
    ipoApp.amount = +ipoApp.amount + addAmount;

    await Promise.all([
      this._ipoAppRepo.save(ipoApp),
      this._appUserService.updateBalance(ipoApp.user_id, {
        balance_avail: balance_avail - addAmount,
        balance_frozen: +balance_frozen + addAmount,
      }),
      this._ipoStockService.changePurchaseQuantity(
        ipoApp.ipo_id,
        purchase_quantity + addQuantity,
      ),
    ]);

    return { isSuccess: true };
  }

  // async cancelByApp(id: number, app_user_id: number) {
  //   const [ipoApp, appUser] = await Promise.all([
  //     this.findOne(id),
  //     this._appUserService.findOne(app_user_id),
  //   ]);

  //   if (ipoApp.user_id !== app_user_id) {
  //     throw new UnauthorizedException(MESSAGE.UNAUTHORIZED);
  //   }
  //   const ipoStock = await this._ipoStockService.findOne(ipoApp.ipo_id);
  //   const { balance_avail, balance_frozen } = appUser;
  //   const { purchase_quantity } = ipoStock;

  //   if (ipoApp.status !== IPO_APP_STATUS.PENDING) {
  //     throw new BadRequestException('Ipo Application is not pending');
  //   }

  //   ipoApp.status = IPO_APP_STATUS.CANCEL;
  //   await Promise.all([
  //     this._ipoAppRepo.save(ipoApp),
  //     this._appUserService.updateBalance(app_user_id, {
  //       balance_avail: balance_avail + ipoApp.amount,
  //       balance_frozen: balance_frozen - ipoApp.amount,
  //     }),
  //     this._ipoStockService.changePurchaseQuantity(
  //       ipoApp.ipo_id,
  //       +purchase_quantity + +ipoApp.quantity,
  //     ),
  //   ]);
  // }

  async remove(id: number) {
    const ipoApp = await this.findOne(id);
    if (
      ![IPO_APP_STATUS.PENDING, IPO_APP_STATUS.FAIL].includes(ipoApp.status)
    ) {
      throw new BadRequestException(IPO_APP_WRONG_STATUS);
    }

    if (ipoApp.status === IPO_APP_STATUS.PENDING) {
      const [ipoStock, appUser] = await Promise.all([
        this._ipoStockService.findOne(ipoApp.ipo_id),
        this._appUserService.findOne(ipoApp.user_id),
      ]);

      const { balance_avail, balance_frozen } = appUser;
      const { purchase_quantity } = ipoStock;

      await Promise.all([
        this._appUserService.updateBalance(ipoApp.user_id, {
          balance_avail: balance_avail + ipoApp.amount,
          balance_frozen: balance_frozen - ipoApp.amount,
        }),
        this._ipoStockService.changePurchaseQuantity(
          ipoApp.ipo_id,
          +purchase_quantity + +ipoApp.quantity,
        ),
      ]);
    }

    ipoApp.is_delete = true;
    await this._ipoAppRepo.save(ipoApp);

    return { isSuccess: true };
  }
}
