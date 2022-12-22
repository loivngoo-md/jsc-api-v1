import { ORDER_TYPE } from '../../../common/enums';

export type OrderQuery = {
  username?: string;
  realname?: string;
  agent?: string;
  superior?: string;
  type?: ORDER_TYPE;
  stock_code?: string;
  start_time?: Date;
  end_time?: Date;
  page?: number;
  limit?: number;
};
