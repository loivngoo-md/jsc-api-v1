import { ApiPropertyOptional } from '@nestjs/swagger';
import { ORDER_TYPE } from '../../../common/enums';
import { PaginationQuery } from '../../../helpers/dto-helper';

export class OrderQuery extends PaginationQuery {
  @ApiPropertyOptional()
  username?: string;

  @ApiPropertyOptional()
  real_name?: string;

  @ApiPropertyOptional()
  superior?: string;

  @ApiPropertyOptional()
  type?: ORDER_TYPE;

  @ApiPropertyOptional()
  stock_code?: string;

  @ApiPropertyOptional()
  start_time?: Date;

  @ApiPropertyOptional()
  end_time?: Date;
}

export class OrderTodayQuery extends PaginationQuery {
  user_id?: number;
}
