import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQuery } from '../../../helpers/dto-helper';

export class IpoStockListQuery extends PaginationQuery {
  @ApiPropertyOptional()
  is_active?: boolean;

  @ApiPropertyOptional()
  code?: string;

  @ApiPropertyOptional()
  name?: string;
}
