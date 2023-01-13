import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQuery } from '../../../helpers/dto-helper';

export class AgentUserListQuery extends PaginationQuery {
  @ApiPropertyOptional()
  path?: string;

  @ApiPropertyOptional()
  real_name?: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional()
  username?: string;
}
