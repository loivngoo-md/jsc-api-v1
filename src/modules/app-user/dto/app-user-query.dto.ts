import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQuery } from '../../../helpers/dto-helper';

export class AppUserListQuery extends PaginationQuery {
  @ApiPropertyOptional()
  agent?: number;

  @ApiPropertyOptional()
  is_real?: boolean;

  @ApiPropertyOptional()
  real_name?: string;

  @ApiPropertyOptional()
  phone?: string;
}

export type SellablePositionsQuery = {
  stock_code: string;
};
