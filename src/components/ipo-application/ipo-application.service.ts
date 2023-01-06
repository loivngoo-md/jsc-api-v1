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
import { UpdateIpoApplicationDto } from './dto/update-ipo-application.dto';
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
    let trading_session = null;
    let addPurchase = 0;
    if (![IPO_APP_STATUS.PENDING, IPO_APP_STATUS.FAIL].includes(status)) {
      if (!actual_quantity) {
        throw new BadRequestException('Missing actual_quantity');
      }
      const session = await this._tradingSessionService.findOpeningSession();
      const rate = session.detail.transactions_rate as any as ITransactionsRate;
      transaction_fees = rate.transaction_fees;
      trading_session = session.id;
    }

    const [userApp, ipoStock] = await Promise.all([
      this._appUserService.findByUsername(username),
      this._ipoStockService.findByCode(ipo_code),
    ]);

    const { price, supply_quantity, purchase_quantity } = ipoStock;
    const amount = price * quantity;
    const actual_amount =
      price * (actual_quantity || 0) * (1 + transaction_fees / 100);
    const { balance_avail, balance_frozen, balance } = userApp;

    const updateBalance = {
      balance_avail,
      balance,
      balance_frozen,
    };

    switch (status) {
      case IPO_APP_STATUS.PENDING:
        Object.assign(updateBalance, {
          balance_avail: +balance_avail - amount,
          balance_frozen: +balance_frozen + amount,
        });
        addPurchase = quantity;
        break;
      case IPO_APP_STATUS.SUCCESS:
        Object.assign(updateBalance, {
          balance_avail: +balance_avail - actual_amount,
          balance_frozen: +balance_frozen + actual_amount,
        });
        addPurchase = actual_amount;
        break;
      case IPO_APP_STATUS.PAID:
      case IPO_APP_STATUS.TRANFER:
        Object.assign(updateBalance, {
          balance_avail: +balance_avail - actual_amount,
          balance: +balance - actual_amount,
        });
        addPurchase = actual_amount;
        break;
    }

    if (addPurchase + purchase_quantity > supply_quantity) {
      throw new BadRequestException('Not enought quantity for purchase.');
    }

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

    const trx = this._ipoAppRepo.create(ipoAppInfo);

    const [ipoApp, _] = await Promise.all([
      this._ipoAppRepo.save(trx),
      this._ipoStockService.changePurchaseQuantity(
        ipoStock.id,
        +purchase_quantity + addPurchase,
      ),
      this._appUserService.updateBalance(userApp.id, updateBalance),
    ]);

    if ([IPO_APP_STATUS.PAID, IPO_APP_STATUS.TRANFER].includes(status)) {
      const trxInfo = {
        trx_id: ipoApp.id,
        type: TRANSACTION_TYPE.BUY_IPO,
        user_id: userApp.id,
        before: balance,
        after: balance - actual_amount,
      };

      await Promise.all([
        this._trxService.addTrx(trxInfo),
        status === IPO_APP_STATUS.TRANFER &&
          this._stockStorageService.store({
            stock_code: convertC2FS(ipo_code),
            amount: actual_amount,
            user_id: userApp.id,
            quantity: actual_quantity,
            trading_session,
            price: ipoStock.price,
            type: TRX_TYPE.IPO,
          }),
      ]);
    }

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

  async findOne(ipo_app_id: number) {
    const ipoApp = await this._ipoAppRepo.findOne({
      where: { id: ipo_app_id, is_delete: false },
    });

    if (!ipoApp) {
      throw new NotFoundException(MESSAGE.notFoundError('Ipo Application'));
    }

    return ipoApp;
  }

  update(id: number, updateIpoApplicationDto: UpdateIpoApplicationDto) {
    return `This action updates a #${id} ipoApplication`;
  }

  remove(id: number) {
    return `This action removes a #${id} ipoApplication`;
  }
}
