import { ORDER_TYPE } from '../../../common/enums';
import { PaginationQuery } from '../../../helpers/dto-helper';

export class OrderQuery extends PaginationQuery {
  username?: string;
  real_name?: string;
  agent?: string;
  superior?: string;
  type?: ORDER_TYPE;
  stock_code?: string;
  start_time?: Date;
  end_time?: Date;
}

export class OrderTodayQuery extends PaginationQuery {
  user_id?: number;
}
