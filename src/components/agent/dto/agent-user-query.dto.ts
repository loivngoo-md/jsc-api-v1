import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQuery } from '../../../helpers/dto-helper';

export class AgentUserListQuery extends PaginationQuery {
  @ApiPropertyOptional()
  sub_agent?: string;

  @ApiPropertyOptional()
  real_name?: string;

  @ApiPropertyOptional()
  phone?: string;
}
