import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQuery } from '../../../helpers/dto-helper';

export class CmsUserListQuery extends PaginationQuery {
  @ApiPropertyOptional()
  username?: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional()
  real_name?: string;
}
