import { TRX_TYPE } from '../../../common/enums';

export class StockStorageStore {
  stock_code: string;
  price: number;
  trading_session: string;
  quantity: number;
  amount: number;
  user_id: number;
  type: TRX_TYPE;
}
