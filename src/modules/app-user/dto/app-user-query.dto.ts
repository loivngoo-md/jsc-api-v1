import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQuery } from '../../../helpers/dto-helper';

export class AppUserListQuery extends PaginationQuery {
  @ApiPropertyOptional()
  superior?: string;

  @ApiPropertyOptional()
  is_real?: boolean;

  @ApiPropertyOptional()
  real_name?: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional()
  username?: string;
}

export class SellablePositionsQuery extends PaginationQuery {
  @ApiProperty()
  stock_code: string;
}
